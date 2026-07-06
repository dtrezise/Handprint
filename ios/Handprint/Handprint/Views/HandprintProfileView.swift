import SwiftUI

struct HandprintProfileView: View {
    @EnvironmentObject private var store: HandprintStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    HandprintGlyphView(marks: store.marks, activeEventId: store.selectedActionId)

                    if let openedHandle = store.openedPublicHandle, openedHandle != store.profile.handle {
                        VStack(alignment: .leading, spacing: 8) {
                            Label("@\(openedHandle)", systemImage: "link")
                                .font(.headline)
                            Text("Public profile deep links are wired. This pilot only has the local profile loaded until backend profiles are connected.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .handprintCard()
                    }

                    VStack(alignment: .leading, spacing: 14) {
                        SectionHeader(eyebrow: "My reach", title: "Pilot identity profile", systemImage: "person.crop.circle")

                        HStack(spacing: 10) {
                            MetricTile(value: "\(store.rsvps.count)", label: "Active actions", systemImage: "calendar.badge.checkmark")
                            MetricTile(value: "\(Set(store.marks.map(\.category)).count)", label: "Categories", systemImage: "circle.grid.2x2")
                        }

                        VStack(alignment: .leading, spacing: 10) {
                            Text("Participation trail")
                                .font(.headline)

                            ForEach(store.completedActions.reversed(), id: \.mark.id) { item in
                                VStack(alignment: .leading, spacing: 5) {
                                    Text(item.mark.label)
                                        .font(.subheadline.weight(.semibold))
                                    Text("\(item.action?.organizer ?? "Verified organizer") - \(item.mark.source)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                            }
                        }
                    }
                    .handprintCard()
                }
                .padding(18)
            }
            .background(HandprintTheme.paper.ignoresSafeArea())
            .navigationTitle("Handprint")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
