import SwiftUI
import UIKit

struct OnboardingView: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var profile = MockHandprintData.profile
    @State private var step = 0
    @State private var accountStatus = "Account ready"

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ProgressView(value: Double(step + 1), total: 3)
                    .tint(HandprintTheme.tide)
                    .padding(.horizontal, 18)

                TabView(selection: $step) {
                    identityStep.tag(0)
                    matchingStep.tag(1)
                    trustStep.tag(2)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                HStack(spacing: 12) {
                    if step > 0 {
                        Button {
                            if reduceMotion { step -= 1 } else { withAnimation { step -= 1 } }
                        } label: {
                            Label("Back", systemImage: "chevron.left")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                    }

                    Button {
                        if step < 2 {
                            if reduceMotion { step += 1 } else { withAnimation { step += 1 } }
                        } else {
                            store.completeOnboarding(profile: profile)
                        }
                    } label: {
                        Label(step == 2 ? "Start finding action" : "Next", systemImage: step == 2 ? "hand.raised.fill" : "chevron.right")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(HandprintTheme.moss)
                    .accessibilityIdentifier("onboarding-primary-button")
                }
                .padding(18)
            }
            .handprintScreenBackground()
            .navigationTitle("Handprint")
            .navigationBarTitleDisplayMode(.inline)
        }
        .handprintKeyboardControls()
    }

    private var identityStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(eyebrow: "Set up", title: "Begin within reach", systemImage: "person.crop.circle")

                VStack(alignment: .leading, spacing: 12) {
                    DarkField(placeholder: "Name", text: $profile.name)
                        .textContentType(.name)
                    DarkField(placeholder: "Handle", text: $profile.handle)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    DarkField(placeholder: "Location", text: $profile.launchCommunity)
                    Stepper("Reach: \(Int(profile.radiusMiles)) miles", value: $profile.radiusMiles, in: 1...150, step: 5)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 10) {
                    Text("Location")
                        .font(.headline)
                    Text("Handprint only needs an approximate area for matching. Precise location history is not stored.")
                        .font(.subheadline)
                        .foregroundStyle(HandprintTheme.muted)
                    HStack {
                        Button {
                            store.requestApproximateLocation()
                            profile.launchCommunity = store.profile.launchCommunity
                        } label: {
                            Label("Use approximate area", systemImage: "location")
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(HandprintTheme.tide)

                        Button {
                            store.continueWithoutLocation()
                        } label: {
                            Text("Skip")
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .handprintCard()
            }
            .padding(18)
        }
    }

    private var matchingStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(eyebrow: "Match", title: "Where can you lend a hand?", systemImage: "sparkles")

                VStack(alignment: .leading, spacing: 12) {
                    Text("Interests")
                        .font(.headline)
                    ForEach(EventCategory.allCases) { category in
                        Toggle(category.rawValue, isOn: binding(for: category))
                    }
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Skills")
                        .font(.headline)
                    TextField("Skills, comma separated", text: skillsText)
                        .submitLabel(.done)
                        .onSubmit {
                            UIApplication.shared.dismissHandprintKeyboard()
                        }
                        .padding(12)
                        .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .handprintKeyboardDismissButton()
                    Picker("Engagement", selection: $profile.engagementLevel) {
                        ForEach(EngagementLevel.allCases) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                }
                .handprintCard()
            }
            .padding(18)
        }
        .onChange(of: store.profile.launchCommunity) { _, newValue in
            if !newValue.isEmpty {
                profile.launchCommunity = newValue
            }
        }
    }

    private var trustStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(eyebrow: "Ready", title: "Make your first mark", systemImage: "checkmark.shield")

                VStack(alignment: .leading, spacing: 12) {
                    Label("Verified World Enablers come first", systemImage: "checkmark.seal")
                    Label("Every match explains why it appears", systemImage: "list.bullet.rectangle")
                    Label("Your public Handprint shows verified participation, not popularity", systemImage: "hand.raised")
                    Label("Wave your Handprint outward and build your network through Shake", systemImage: "hand.wave")
                    Label("Sign in with Apple will protect accounts without social graph imports", systemImage: "apple.logo")
                }
                .font(.subheadline.weight(.semibold))
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Account")
                        .font(.headline)
                    Button {
                        store.authState = .signedIn
                        accountStatus = "Signed in"
                    } label: {
                        Label("Continue", systemImage: "person.crop.circle.badge.checkmark")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(HandprintTheme.moss)
                    Text(accountStatus)
                        .font(.caption)
                        .foregroundStyle(HandprintTheme.muted)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 8) {
                    Text("First share link")
                        .font(.headline)
                    Text("handprint://u/\(profile.handle)")
                        .font(.footnote.weight(.semibold))
                        .textSelection(.enabled)
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                .handprintCard()
            }
            .padding(18)
        }
    }

    private func binding(for category: EventCategory) -> Binding<Bool> {
        Binding(
            get: { profile.interests.contains(category) },
            set: { isSelected in
                if isSelected {
                    profile.interests.insert(category)
                } else {
                    profile.interests.remove(category)
                }
            }
        )
    }

    private var skillsText: Binding<String> {
        Binding(
            get: { profile.skills.sorted().joined(separator: ", ") },
            set: { value in
                profile.skills = Set(value.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty })
            }
        )
    }
}
