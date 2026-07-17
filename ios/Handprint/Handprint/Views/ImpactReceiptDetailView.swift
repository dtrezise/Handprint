import SwiftUI

struct ImpactReceiptDetailView: View {
    @EnvironmentObject private var store: HandprintStore
    let receipt: ImpactReceipt

    private var organizer: OrganizerImpactProfile? {
        store.organizerProfiles.first { $0.id == receipt.organizerId || $0.handle == receipt.organizerId }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Verified mark")
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(HandprintTheme.mossBright)
                    Text(receipt.title)
                        .font(.title.bold())
                        .fixedSize(horizontal: false, vertical: true)
                    Label("This contribution changed something real and remains part of the Handprint record.", systemImage: "checkmark.seal.fill")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(HandprintTheme.mossBright)
                    Text(receipt.accomplishment)
                        .font(.body)
                        .foregroundStyle(HandprintTheme.muted)
                }
                .handprintCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Verified accomplishment")
                        .font(.headline)
                    ReceiptRow(label: "Beneficiary", value: receipt.beneficiary)
                    ReceiptRow(label: "Confirmed by", value: receipt.confirmedBy)
                    ReceiptRow(label: "Issued", value: receipt.issuedAt)
                    ReceiptRow(label: "Evidence", value: receipt.evidence)
                }
                .handprintCard()

                if let organizer {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("World Enabler Handprint")
                            .font(.headline)
                        Text(organizer.name)
                            .font(.title3.weight(.semibold))
                        Text(organizer.publicSummary)
                            .font(.subheadline)
                            .foregroundStyle(HandprintTheme.muted)
                    }
                    .handprintCard()
                }
            }
            .padding(18)
        }
        .handprintScreenBackground()
        .navigationTitle("Receipt")
        .navigationBarTitleDisplayMode(.inline)
        .handprintKeyboardControls()
    }
}

private struct ReceiptRow: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption.weight(.bold))
                .textCase(.uppercase)
                .foregroundStyle(HandprintTheme.muted)
            Text(value)
                .font(.subheadline)
                .foregroundStyle(HandprintTheme.ink)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}
