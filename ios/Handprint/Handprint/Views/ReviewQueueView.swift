import SwiftUI

struct ReviewQueueView: View {
    @EnvironmentObject private var store: HandprintStore

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Label("\(store.pendingReviewActions.count)", systemImage: "tray.full")
                            .font(.title2.bold())
                        Text("actions need human review before broad listing.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
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
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            StatusPill(action: action)
                        }

                        Text(action.reviewNote)
                            .font(.subheadline)
                            .foregroundStyle(.black.opacity(0.72))

                        Text(action.safetyNote)
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        HStack {
                            Button {
                                store.escalate(action)
                            } label: {
                                Label("Escalate", systemImage: "exclamationmark.shield")
                            }
                            .buttonStyle(.bordered)
                            .disabled(action.status == .rejected)

                            Button {
                                store.reject(action)
                            } label: {
                                Label("Reject", systemImage: "xmark")
                            }
                            .buttonStyle(.bordered)
                            .disabled(action.status == .approved)

                            Button {
                                store.approve(action)
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
            .navigationTitle("Review")
        }
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
