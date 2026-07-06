import SwiftUI

struct DiscoverView: View {
    @EnvironmentObject private var store: HandprintStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(eyebrow: "Discover", title: "Useful action this week", systemImage: "sparkle.magnifyingglass")

                    HStack(spacing: 10) {
                        MetricTile(value: "\(store.recommendations.count)", label: "Matches", systemImage: "sparkles")
                        MetricTile(value: store.syncStatus, label: "Data source", systemImage: "icloud.and.arrow.down")
                    }

                    ForEach(store.recommendations) { recommendation in
                        ActionCard(recommendation: recommendation)
                    }
                }
                .padding(18)
            }
            .background(HandprintTheme.paper.ignoresSafeArea())
            .navigationTitle("Handprint")
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(for: LocalAction.self) { action in
                EventDetailView(action: action)
            }
        }
    }
}

private struct ActionCard: View {
    @EnvironmentObject private var store: HandprintStore
    let recommendation: Recommendation

    private var action: LocalAction { recommendation.action }
    private var rsvp: RsvpStatus? { store.rsvps[action.id] }
    private var isJoinable: Bool { action.status == .approved }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: action.category.symbolName)
                    .font(.title3)
                    .foregroundStyle(action.category.color)
                    .frame(width: 44, height: 44)
                    .background(action.category.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                VStack(alignment: .leading, spacing: 5) {
                    Text(action.title)
                        .font(.headline)
                        .foregroundStyle(HandprintTheme.ink)
                    Text(action.organizer)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()
                StatusPill(action: action)
            }

            Text(action.summary)
                .font(.subheadline)
                .foregroundStyle(.black.opacity(0.72))

            ReasonChips(reasons: recommendation.reasons)

            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(action.startsAt)
                        .font(.subheadline.weight(.semibold))
                    Text("\(action.neighborhood) - \(String(format: "%.1f", action.distanceMiles)) mi")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 5) {
                    Text("Fit \(recommendation.score)")
                        .font(.caption.weight(.bold))
                    ProgressView(value: Double(max(0, min(100, recommendation.score))), total: 100)
                        .frame(width: 92)
                        .tint(HandprintTheme.tide)
                }
            }

            HStack(spacing: 10) {
                NavigationLink(value: action) {
                    Label("Details", systemImage: "info.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)

                Button {
                    store.setRSVP(.going, for: action)
                } label: {
                    Label(rsvp?.label ?? "RSVP", systemImage: rsvp == nil ? "plus" : "checkmark.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(rsvp == nil ? HandprintTheme.ink : HandprintTheme.moss)
                .disabled(!isJoinable)
                .accessibilityIdentifier("action-rsvp-\(action.id)")
            }
        }
        .handprintCard()
    }
}

private struct EventDetailView: View {
    @EnvironmentObject private var store: HandprintStore
    let action: LocalAction
    @State private var reportReason: EventReportReason = .misleading
    @State private var reportNote = ""
    @State private var didReport = false

    private var recommendation: Recommendation { store.score(action: action) }
    private var rsvp: RsvpStatus? { store.rsvps[action.id] }
    private var isJoinable: Bool { action.status == .approved }
    private var actionShareURL: URL { URL(string: "https://handprint.local/actions/\(action.id)")! }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: action.category.symbolName)
                            .font(.title2)
                            .foregroundStyle(action.category.color)
                            .frame(width: 52, height: 52)
                            .background(action.category.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                        VStack(alignment: .leading, spacing: 5) {
                            Text(action.title)
                                .font(.title.bold())
                                .fixedSize(horizontal: false, vertical: true)
                            Text(action.organizer)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()
                    }

                    StatusPill(action: action)

                    Text(action.summary)
                        .font(.body)
                        .foregroundStyle(.black.opacity(0.72))

                    ReasonChips(reasons: recommendation.reasons)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Action details")
                        .font(.headline)
                    HStack(spacing: 10) {
                        MetricTile(value: action.startsAt, label: action.duration, systemImage: "calendar")
                        MetricTile(value: action.neighborhood, label: "\(String(format: "%.1f", action.distanceMiles)) mi away", systemImage: "mappin.and.ellipse")
                    }
                    HStack(spacing: 10) {
                        MetricTile(value: action.impact, label: "Expected impact", systemImage: "hands.sparkles")
                        MetricTile(value: "\(max(0, action.capacity - action.attending))", label: "Spots left", systemImage: "person.2")
                    }
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 10) {
                    Text("Trust and safety")
                        .font(.headline)
                    Text(action.safetyNote)
                        .font(.subheadline)
                        .foregroundStyle(.black.opacity(0.72))
                    Text(action.reviewNote)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .handprintCard()

                VStack(spacing: 10) {
                    Button {
                        store.setRSVP(.going, for: action)
                    } label: {
                        Label(rsvp?.label ?? "RSVP", systemImage: rsvp == nil ? "plus" : "checkmark.circle")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(rsvp == nil ? HandprintTheme.ink : HandprintTheme.moss)
                    .disabled(!isJoinable)

                    Button {
                        store.setRSVP(.checkedIn, for: action)
                    } label: {
                        Label("Check in", systemImage: "checkmark.seal")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .disabled(!isJoinable || rsvp == nil)

                    ShareLink(
                        item: actionShareURL,
                        subject: Text(action.title),
                        message: Text("Join me for \(action.title) through Handprint.")
                    ) {
                        Label("Share this action", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Report a concern")
                        .font(.headline)
                    Picker("Reason", selection: $reportReason) {
                        ForEach(EventReportReason.allCases) { reason in
                            Text(reason.rawValue).tag(reason)
                        }
                    }
                    TextField("What should reviewers know?", text: $reportNote, axis: .vertical)
                        .textFieldStyle(.roundedBorder)
                    Button {
                        store.report(action, reason: reportReason, note: reportNote)
                        reportNote = ""
                        didReport = true
                    } label: {
                        Label("Send to review", systemImage: "exclamationmark.shield")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .tint(HandprintTheme.coral)

                    if didReport {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(store.lastReportConfirmation?.message ?? "Sent to the trust queue.")
                                .font(.footnote.weight(.semibold))
                                .foregroundStyle(HandprintTheme.moss)
                            Text("You can see report history on your Handprint tab during the pilot.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .handprintCard()
            }
            .padding(18)
        }
        .background(HandprintTheme.paper.ignoresSafeArea())
        .navigationTitle("Action")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            store.selectedActionId = action.id
        }
    }
}
