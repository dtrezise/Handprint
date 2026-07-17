import SwiftUI

struct OrganizationHandprintView: View {
    @EnvironmentObject private var store: HandprintStore
    let organizer: OrganizerImpactProfile

    private var receipts: [ImpactReceipt] {
        store.receipts(for: organizer)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 12) {
                    Text(organizer.trustTier.rawValue)
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(HandprintTheme.mossBright)
                    Text(organizer.name)
                        .font(.title.bold())
                        .fixedSize(horizontal: false, vertical: true)
                    Text(organizer.type)
                        .font(.headline)
                        .foregroundStyle(HandprintTheme.muted)
                    Text(organizer.publicSummary)
                        .font(.body)
                        .foregroundStyle(HandprintTheme.muted)
                    Button {
                        store.toggleFollow(organizer)
                    } label: {
                        Label(organizer.savedByViewer == true ? "In your Shake network" : "Add to Shake network", systemImage: organizer.savedByViewer == true ? "heart.fill" : "heart")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(organizer.savedByViewer == true ? HandprintTheme.coral : HandprintTheme.tide)
                }
                .handprintCard()

                MetricStrip(metrics: [
                    ("\(organizer.attendeesMobilized)", "Mobilized", "person.2"),
                    ("\(organizer.confirmedParticipants)", "Confirmed", "checkmark.seal"),
                    ("\(organizer.volunteerHours)", "Hours", "clock"),
                    ("\(organizer.accolades.filter { $0.status == "approved" }.count)", "Accolades", "rosette")
                ])

                VStack(alignment: .leading, spacing: 12) {
                    Text("Impact highlights")
                        .font(.headline)
                    ForEach(organizer.impactHighlights) { highlight in
                        InfoRow(label: highlight.label, value: highlight.value, systemImage: "sparkles")
                    }
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Grant-ready proof")
                        .font(.headline)
                    Text(organizer.grantReadySummary)
                        .font(.subheadline)
                        .foregroundStyle(HandprintTheme.muted)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Accolades")
                        .font(.headline)
                    ForEach(organizer.accolades) { accolade in
                        VStack(alignment: .leading, spacing: 6) {
                            InfoRow(label: accolade.category, value: "\(accolade.title): \(accolade.evidence)", systemImage: "rosette")
                        }
                    }
                }
                .handprintCard()

                if !receipts.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Impact receipts")
                            .font(.headline)
                        ForEach(receipts) { receipt in
                            NavigationLink(value: receipt) {
                                InfoRow(label: "\(receipt.confirmedBy) - \(receipt.issuedAt)", value: "\(receipt.title): \(receipt.accomplishment)", systemImage: "doc.badge.checkmark")
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .handprintCard()
                }
            }
            .padding(18)
        }
        .handprintScreenBackground()
        .navigationTitle("World Enabler")
        .navigationBarTitleDisplayMode(.inline)
        .handprintKeyboardControls()
    }
}
