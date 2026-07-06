import SwiftUI

struct ShareHandprintView: View {
    @EnvironmentObject private var store: HandprintStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(eyebrow: "Share", title: "Your public Handprint", systemImage: "square.and.arrow.up")

                    VStack(alignment: .leading, spacing: 14) {
                        HandprintGlyphView(marks: store.marks, activeEventId: nil)

                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                VStack(alignment: .leading, spacing: 5) {
                                    Text("\(store.profile.name)'s Handprint")
                                        .font(.title2.bold())
                                    Text("@\(store.profile.handle)")
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(HandprintTheme.tide)
                                }
                                Spacer()
                                Image(systemName: "hand.raised.fill")
                                    .font(.system(size: 34))
                                    .foregroundStyle(HandprintTheme.coral)
                            }

                            HStack(spacing: 10) {
                                MetricTile(value: "\(store.marks.count)", label: "Visible marks", systemImage: "sparkles")
                                MetricTile(value: "\(store.nextJoinableActions.count)", label: "Join next", systemImage: "arrowshape.turn.up.right")
                            }
                        }
                        .padding(14)
                        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                        VStack(alignment: .leading, spacing: 6) {
                            Text("@\(store.profile.handle)")
                                .font(.title2.bold())
                            Text("A public civic identity page with what you have done, what you are doing next, and how others can join in.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        VStack(alignment: .leading, spacing: 8) {
                            Text(store.shareURL.absoluteString)
                                .font(.footnote.weight(.semibold))
                                .textSelection(.enabled)
                            Text("Deep link: handprint://u/\(store.profile.handle)")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.secondary)
                                .textSelection(.enabled)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                        ShareLink(
                            item: store.shareURL,
                            subject: Text("\(store.profile.name)'s Handprint"),
                            message: Text("See what \(store.profile.name) has done locally and join what is next.")
                        ) {
                            Label("Share my Handprint", systemImage: "square.and.arrow.up")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(HandprintTheme.tide)
                    }
                    .handprintCard()

                    VStack(alignment: .leading, spacing: 12) {
                        Text("What others will see")
                            .font(.headline)
                        ForEach(store.completedActions.suffix(3), id: \.mark.id) { item in
                            Text(item.mark.label)
                                .font(.subheadline.weight(.semibold))
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                    }
                    .handprintCard()

                    VStack(alignment: .leading, spacing: 12) {
                        Text("How they can join in")
                            .font(.headline)
                        ForEach(store.nextJoinableActions) { action in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(action.title)
                                    .font(.subheadline.weight(.semibold))
                                Text("\(action.startsAt) - \(action.neighborhood)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                    }
                    .handprintCard()
                }
                .padding(18)
            }
            .background(HandprintTheme.paper.ignoresSafeArea())
            .navigationTitle("Share")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
