import SwiftUI

struct SectionHeader: View {
    let eyebrow: String
    let title: String
    var systemImage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(eyebrow.uppercased())
                    .font(.caption.weight(.semibold))
                    .tracking(1.4)
            }
            .foregroundStyle(HandprintTheme.tide)

            Text(title)
                .font(.largeTitle.bold())
                .foregroundStyle(HandprintTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

struct StatusPill: View {
    let action: LocalAction

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(color.opacity(0.14), in: Capsule())
            .foregroundStyle(color)
    }

    private var label: String {
        action.status == .approved ? action.trustTier.rawValue : action.status.rawValue.capitalized
    }

    private var color: Color {
        switch action.status {
        case .approved: HandprintTheme.moss
        case .pending: HandprintTheme.gold
        case .escalated: HandprintTheme.coral
        case .rejected: .secondary
        }
    }
}

struct ReasonChips: View {
    let reasons: [String]

    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(reasons, id: \.self) { reason in
                Text(reason)
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(HandprintTheme.paper, in: Capsule())
                    .foregroundStyle(.black.opacity(0.68))
            }
        }
    }
}

struct MetricTile: View {
    let value: String
    let label: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: systemImage)
                .foregroundStyle(HandprintTheme.tide)
            Text(value)
                .font(.title2.bold())
                .minimumScaleFactor(0.72)
                .lineLimit(2)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 320
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > width {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            currentX += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }

        return CGSize(width: width, height: currentY + lineHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var currentX = bounds.minX
        var currentY = bounds.minY
        var lineHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > bounds.maxX {
                currentX = bounds.minX
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            subview.place(at: CGPoint(x: currentX, y: currentY), proposal: ProposedViewSize(size))
            currentX += size.width + spacing
            lineHeight = max(lineHeight, size.height)
        }
    }
}
