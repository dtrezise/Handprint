import SwiftUI

struct OrganizeView: View {
    @EnvironmentObject private var store: HandprintStore
    @State private var draft = OrganizerDraft()
    @State private var submitted = false

    private var credibilityPoints: Int { store.worldChangerPoints }
    private var isWorldEnablerUnlocked: Bool { credibilityPoints >= 260 }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(eyebrow: "World Enabler", title: "Create useful action", systemImage: "hands.sparkles")

                    WorldEnablerPathCard(points: credibilityPoints, unlocked: isWorldEnablerUnlocked)

                    if isWorldEnablerUnlocked {
                        WorldEnablerDashboard()
                    } else {
                        LockedWorldEnablerCard(pointsRemaining: max(0, 260 - credibilityPoints))
                    }

                    EventSubmissionCard(draft: $draft, submitted: $submitted, unlocked: isWorldEnablerUnlocked)

                    RubricCard()
                }
                .padding(18)
            }
            .handprintScreenBackground()
            .navigationTitle("World Enabler")
            .navigationBarTitleDisplayMode(.inline)
        }
        .handprintKeyboardControls()
    }
}

private struct WorldEnablerPathCard: View {
    let points: Int
    let unlocked: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            CompactHeader(
                title: "Earn the right to host",
                subtitle: "World Enablers create useful, affirming, verifiable opportunities for others.",
                systemImage: "lock.open"
            )
            MetricStrip(metrics: [
                ("\(points)", "Credibility", "trophy"),
                (unlocked ? "Open" : "Locked", "Portal", unlocked ? "lock.open" : "lock")
            ])
            ProgressView(value: min(1, Double(points) / 260.0))
                .tint(unlocked ? HandprintTheme.moss : HandprintTheme.gold)
            Text(unlocked ? "World Enabler portal unlocked." : "\(max(0, 260 - points)) more credibility points to unlock hosting.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(unlocked ? HandprintTheme.moss : HandprintTheme.muted)
        }
        .handprintCard()
    }
}

private struct LockedWorldEnablerCard: View {
    let pointsRemaining: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Build trust first", systemImage: "checkmark.shield")
                .font(.headline)
            Text("Hosting stays locked until a World Changer shows reliable follow-through. That keeps Handprint focused on useful action instead of noisy posting.")
                .font(.subheadline)
                .foregroundStyle(HandprintTheme.muted)
            PillRow(labels: ["Attend", "Check in", "Get confirmed", "Refer well"], color: HandprintTheme.tide)
            Text("\(pointsRemaining) points remaining")
                .font(.caption.weight(.bold))
                .foregroundStyle(HandprintTheme.goldBright)
        }
        .handprintCard()
    }
}

private struct WorldEnablerDashboard: View {
    @EnvironmentObject private var store: HandprintStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            CompactHeader(
                title: "Portal preview",
                subtitle: "A working dashboard for hosted events, confirmations, impact receipts, and sponsor readiness.",
                systemImage: "rectangle.grid.2x2"
            )
            MetricStrip(metrics: [
                ("\(store.pendingReviewActions.count)", "In review", "hourglass"),
                ("\(store.impactReceipts.count)", "Receipts", "doc.badge.checkmark")
            ])
            InfoRow(label: "World Enabler confirmation", value: "Confirm attendance after an event to upgrade check-ins into higher-trust points.", systemImage: "checkmark.seal")
            InfoRow(label: "Sponsor readiness", value: "Sponsor slots stay review-controlled and should support rewards without creating ad clutter.", systemImage: "sparkles")
        }
        .handprintCard()
    }
}

private struct EventSubmissionCard: View {
    @EnvironmentObject private var store: HandprintStore
    @Binding var draft: OrganizerDraft
    @Binding var submitted: Bool
    let unlocked: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            CompactHeader(title: "Submit a useful action", subtitle: "The listing should do something measurable for a beneficiary or community.", systemImage: "paperplane")

            DarkField(placeholder: "Action title", text: $draft.title)
            DarkField(placeholder: "World Enabler", text: $draft.organizer)
            DarkField(placeholder: "Community affiliation", text: $draft.communityAffiliation)
            DarkField(placeholder: "Website or social proof", text: $draft.organizerWebsite)
                .textInputAutocapitalization(.never)
                .keyboardType(.URL)
            DarkField(placeholder: "Contact email", text: $draft.contactEmail)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)

            HStack(spacing: 10) {
                DarkField(placeholder: "Neighborhood", text: $draft.neighborhood)
                DarkField(placeholder: "Location", text: $draft.locationName)
            }

            HStack(spacing: 10) {
                DarkField(placeholder: "Starts at", text: $draft.startsAt)
                DarkField(placeholder: "Duration", text: $draft.duration)
            }

            Stepper("Capacity: \(draft.capacity)", value: $draft.capacity, in: 1...500)
                .font(.subheadline.weight(.semibold))

            Picker("Category", selection: $draft.category) {
                ForEach(EventCategory.allCases) { category in
                    Text(category.rawValue).tag(category)
                }
            }
            .pickerStyle(.menu)
            .tint(HandprintTheme.tide)

            Picker("Listing type", selection: $draft.listingType) {
                ForEach(EventListingType.allCases) { type in
                    Text(type.label).tag(type)
                }
            }
            .pickerStyle(.segmented)

            DarkField(placeholder: "Skills needed", text: $draft.skills)

            VStack(alignment: .leading, spacing: 6) {
                Text("What should participants expect?")
                    .font(.headline)
                TextEditor(text: $draft.summary)
                    .frame(minHeight: 112)
                    .padding(8)
                    .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .handprintKeyboardDismissButton()
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Safety and trust notes")
                    .font(.headline)
                TextEditor(text: $draft.safetyNote)
                    .frame(minHeight: 88)
                    .padding(8)
                    .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .handprintKeyboardDismissButton()
            }

            Toggle("I can verify this World Enabler and the listing is accurate.", isOn: $draft.termsAccepted)
                .font(.subheadline.weight(.semibold))

            Button {
                store.submit(draft)
                draft = OrganizerDraft()
                submitted = true
            } label: {
                Label("Submit for review", systemImage: "paperplane")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(HandprintTheme.moss)
            .disabled(!draft.isSubmittable || !unlocked)

            if submitted {
                Label("Submitted to the trust queue.", systemImage: "checkmark.circle")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(HandprintTheme.mossBright)
            }
        }
        .handprintCard()
    }
}

private struct RubricCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            CompactHeader(title: "Do Something rubric", subtitle: "The native app uses the same action-first review model as the website.", systemImage: "checklist")
            InfoRow(label: "Useful action", value: "The event performs a practical service, creates a tangible output, or directly helps a beneficiary.", systemImage: "hands.sparkles")
            InfoRow(label: "Verification", value: "The World Enabler can confirm attendance, role, and outcome after the event.", systemImage: "doc.badge.checkmark")
            InfoRow(label: "Awareness bridge", value: "Awareness listings can be promoted, but rewards require a hands-on action bridge.", systemImage: "arrow.triangle.branch")
            InfoRow(label: "Safety", value: "Youth, medical, driving, court-service, and fundraising contexts escalate for extra review.", systemImage: "checkmark.shield")
        }
        .handprintCard()
    }
}
