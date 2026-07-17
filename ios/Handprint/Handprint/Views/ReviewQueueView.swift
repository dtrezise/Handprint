import SwiftUI

struct ReviewQueueView: View {
    @EnvironmentObject private var store: HandprintStore
    @State private var reviewStatus = "Select a review action to update the queue."

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Label("\(store.pendingReviewActions.count)", systemImage: "tray.full")
                            .font(.title2.bold())
                        Text("actions need human review before broad listing.")
                            .font(.subheadline)
                            .foregroundStyle(HandprintTheme.muted)
                    }

                    if !store.openReports.isEmpty {
                        Label("\(store.openReports.count) open reports", systemImage: "exclamationmark.shield")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(HandprintTheme.coralBright)
                    }

                    Label(reviewStatus, systemImage: "checkmark.circle")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(HandprintTheme.muted)
                }

                if !store.openReports.isEmpty {
                    Section("Reports") {
                        ForEach(store.openReports) { report in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(report.reason.rawValue)
                                    .font(.headline)
                                Text(store.actions.first(where: { $0.id == report.eventId })?.title ?? report.eventId)
                                    .font(.subheadline.weight(.semibold))
                                if !report.note.isEmpty {
                                    Text(report.note)
                                        .font(.caption)
                                        .foregroundStyle(HandprintTheme.muted)
                                }
                            }
                            .padding(.vertical, 6)
                        }
                    }
                }

                ForEach(sortedActions) { action in
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(action.title)
                                    .font(.headline)
                                Text("\(action.organizer) - \(action.neighborhood)")
                                    .font(.caption)
                                    .foregroundStyle(HandprintTheme.muted)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 6) {
                                StatusPill(action: action)
                                ListingPill(action: action)
                            }
                        }

                        Text(action.reviewNote)
                            .font(.subheadline)
                            .foregroundStyle(HandprintTheme.muted)

                        Text(action.safetyNote)
                            .font(.caption)
                            .foregroundStyle(HandprintTheme.muted)

                        if action.listingTypeValue == .sponsored || action.listingTypeValue == .awareness {
                            Label(
                                action.listingTypeValue == .sponsored ? "Sponsored visibility does not buy trust, rewards, or accolades." : "Awareness listings need an action bridge before rewards.",
                                systemImage: "list.clipboard"
                            )
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(HandprintTheme.tideBright)
                        }

                        HStack {
                            Button {
                                store.escalate(action)
                                reviewStatus = "Escalated \(action.title)."
                            } label: {
                                Label("Escalate", systemImage: "exclamationmark.shield")
                            }
                            .buttonStyle(.bordered)
                            .disabled(action.status == .rejected)

                            Button {
                                store.reject(action)
                                reviewStatus = "Rejected \(action.title)."
                            } label: {
                                Label("Reject", systemImage: "xmark")
                            }
                            .buttonStyle(.bordered)
                            .disabled(action.status == .approved)

                            Button {
                                store.approve(action)
                                reviewStatus = "Approved \(action.title)."
                            } label: {
                                Label("Approve", systemImage: "checkmark")
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(HandprintTheme.moss)
                            .disabled(action.status == .rejected)
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .scrollContentBackground(.hidden)
            .background(HandprintTheme.background)
            .navigationTitle("Review")
        }
        .handprintKeyboardControls()
    }

    private var sortedActions: [LocalAction] {
        store.actions.sorted { lhs, rhs in
            rank(lhs.status) < rank(rhs.status)
        }
    }

    private func rank(_ status: EventStatus) -> Int {
        switch status {
        case .pending: 0
        case .escalated: 1
        case .approved: 2
        case .rejected: 3
        }
    }
}
