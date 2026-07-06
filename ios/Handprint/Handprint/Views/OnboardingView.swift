import AuthenticationServices
import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject private var store: HandprintStore
    @State private var profile = MockHandprintData.profile
    @State private var step = 0

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
                            withAnimation { step -= 1 }
                        } label: {
                            Label("Back", systemImage: "chevron.left")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                    }

                    Button {
                        if step < 2 {
                            withAnimation { step += 1 }
                        } else {
                            store.completeOnboarding(profile: profile)
                        }
                    } label: {
                        Label(step == 2 ? "Start finding action" : "Next", systemImage: step == 2 ? "hand.raised.fill" : "chevron.right")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(HandprintTheme.ink)
                    .accessibilityIdentifier("onboarding-primary-button")
                }
                .padding(18)
            }
            .background(HandprintTheme.paper.ignoresSafeArea())
            .navigationTitle("Handprint")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var identityStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(eyebrow: "Set up", title: "Make this yours", systemImage: "person.crop.circle")

                VStack(alignment: .leading, spacing: 12) {
                    TextField("Name", text: $profile.name)
                        .textContentType(.name)
                    TextField("Handle", text: $profile.handle)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    TextField("Launch community", text: $profile.launchCommunity)
                    Stepper("Reach: \(Int(profile.radiusMiles)) miles", value: $profile.radiusMiles, in: 1...25, step: 1)
                }
                .textFieldStyle(.roundedBorder)
                .handprintCard()

                VStack(alignment: .leading, spacing: 10) {
                    Text("Location")
                        .font(.headline)
                    Text("Handprint only needs an approximate area for matching. Precise location history is not part of the pilot.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    HStack {
                        Button {
                            store.requestApproximateLocation()
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
                SectionHeader(eyebrow: "Match", title: "What feels useful?", systemImage: "sparkles")

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
                        .textFieldStyle(.roundedBorder)
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
    }

    private var trustStep: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(eyebrow: "Ready", title: "Find something real", systemImage: "checkmark.shield")

                VStack(alignment: .leading, spacing: 12) {
                    Label("Verified organizers come first", systemImage: "checkmark.seal")
                    Label("Every match explains why it appears", systemImage: "list.bullet.rectangle")
                    Label("Your public Handprint shows verified participation, not popularity", systemImage: "hand.raised")
                    Label("Sign in with Apple will protect accounts without social graph imports", systemImage: "apple.logo")
                }
                .font(.subheadline.weight(.semibold))
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Account shell")
                        .font(.headline)
                    SignInWithAppleButton(.continue) { _ in
                    } onCompletion: { _ in
                        store.authState = .signedIn
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 50)
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    Text("Apple account entitlements are not enabled yet. This is the production account path shell.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
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
                        .background(.white, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
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
