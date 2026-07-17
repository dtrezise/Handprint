import SwiftUI
import UIKit

func displayMarkSource(_ source: String) -> String {
    source == "Organizer confirmed" ? "World Enabler confirmed" : source
}

struct SectionHeader: View {
    let eyebrow: String
    let title: String
    var systemImage: String?
    var compact = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(eyebrow.uppercased())
                    .font(.caption.weight(.semibold))
                    .tracking(1.4)
                    .lineLimit(1)
            }
            .foregroundStyle(HandprintTheme.tideBright)

            Text(title)
                .font(compact ? .headline : .title.bold())
                .foregroundStyle(HandprintTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
                .lineLimit(compact ? 2 : 3)
                .minimumScaleFactor(0.82)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct ProfileSettingsButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: "person.crop.circle")
                .font(.title3)
        }
        .accessibilityLabel("Profile and settings")
        .accessibilityIdentifier("profile-settings-button")
    }
}

extension View {
    func handprintKeyboardDismissButton() -> some View {
        self
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button {
                        UIApplication.shared.dismissHandprintKeyboard()
                    } label: {
                        Label("Dismiss keyboard", systemImage: "keyboard.chevron.compact.down")
                    }
                    .font(.body.weight(.semibold))
                }
            }
    }

    func handprintKeyboardControls() -> some View {
        self
            .scrollDismissesKeyboard(.interactively)
            .handprintKeyboardDismissButton()
    }
}

extension UIApplication {
    func dismissHandprintKeyboard() {
        sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

struct CompactHeader: View {
    let title: String
    var subtitle: String?
    var systemImage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Label {
                Text(title)
                    .font(.headline)
                    .lineLimit(2)
                    .minimumScaleFactor(0.85)
            } icon: {
                if let systemImage {
                    Image(systemName: systemImage)
                }
            }
            if let subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(HandprintTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct StatusPill: View {
    let action: LocalAction

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .lineLimit(1)
            .minimumScaleFactor(0.76)
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

struct ListingPill: View {
    let action: LocalAction

    var body: some View {
        Text(action.rewardLabel)
            .font(.caption.weight(.semibold))
            .lineLimit(1)
            .minimumScaleFactor(0.76)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(color.opacity(0.14), in: Capsule())
            .foregroundStyle(color)
    }

    private var color: Color {
        if action.isRewardEligible { return HandprintTheme.gold }
        if action.listingTypeValue == .sponsored { return HandprintTheme.tide }
        return .secondary
    }
}

struct ReasonChips: View {
    let reasons: [String]

    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(reasons, id: \.self) { reason in
                Text(reason)
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.82)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(HandprintTheme.paper, in: Capsule())
                    .foregroundStyle(HandprintTheme.muted)
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
                .foregroundStyle(HandprintTheme.tideBright)
            Text(value)
                .font(.title2.bold())
                .fixedSize(horizontal: false, vertical: true)
            Text(label)
                .font(.caption)
                .foregroundStyle(HandprintTheme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

struct MetricStrip: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    let metrics: [(value: String, label: String, systemImage: String)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 10) {
            ForEach(metrics, id: \.label) { metric in
                MetricTile(value: metric.value, label: metric.label, systemImage: metric.systemImage)
            }
        }
    }

    private var columns: [GridItem] {
        dynamicTypeSize.isAccessibilitySize ? [GridItem(.flexible())] : [GridItem(.flexible()), GridItem(.flexible())]
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    var systemImage: String?

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            if let systemImage {
                Image(systemName: systemImage)
                    .foregroundStyle(HandprintTheme.tideBright)
                    .frame(width: 20)
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(label)
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(HandprintTheme.muted)
                Text(value)
                    .font(.subheadline)
                    .foregroundStyle(HandprintTheme.ink)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
        .padding(10)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

struct PillRow: View {
    let labels: [String]
    var color = HandprintTheme.tide

    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(labels, id: \.self) { label in
                Text(label)
                    .font(.caption.weight(.semibold))
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(color.opacity(0.13), in: Capsule())
                    .foregroundStyle(color)
            }
        }
    }
}

struct DarkField: View {
    let placeholder: String
    @Binding var text: String
    var axis: Axis = .horizontal

    var body: some View {
        TextField(placeholder, text: $text, axis: axis)
            .textInputAutocapitalization(.words)
            .submitLabel(.done)
            .onSubmit {
                UIApplication.shared.dismissHandprintKeyboard()
            }
            .padding(12)
            .background(HandprintTheme.field, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(HandprintTheme.tideSoft.opacity(0.55), lineWidth: 1)
            )
            .accessibilityIdentifier("field-\(fieldIdentifier)")
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button {
                        UIApplication.shared.dismissHandprintKeyboard()
                    } label: {
                        Label("Dismiss keyboard", systemImage: "keyboard.chevron.compact.down")
                    }
                    .font(.body.weight(.semibold))
                }
            }
    }

    private var fieldIdentifier: String {
        placeholder
            .lowercased()
            .replacingOccurrences(of: " ", with: "-")
            .replacingOccurrences(of: ",", with: "")
            .replacingOccurrences(of: "/", with: "-")
    }
}

struct SelectionPill: View {
    let label: String
    var color = HandprintTheme.tide
    var isSelected = false
    var isLocked = false

    var body: some View {
        HStack(spacing: 5) {
            if isLocked {
                Image(systemName: "lock.fill")
            } else if isSelected {
                Image(systemName: "checkmark")
            }
            Text(label)
                .fixedSize(horizontal: false, vertical: true)
        }
        .font(.caption.weight(.semibold))
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(backgroundColor, in: Capsule())
        .foregroundStyle(foregroundColor)
        .overlay(
            Capsule()
                .stroke(isSelected ? color.opacity(0.75) : HandprintTheme.border, lineWidth: 1)
        )
        .opacity(isLocked ? 0.52 : 1)
    }

    private var backgroundColor: Color {
        if isLocked { return HandprintTheme.field }
        return isSelected ? color.opacity(0.24) : HandprintTheme.paper
    }

    private var foregroundColor: Color {
        if isLocked { return HandprintTheme.muted }
        return isSelected ? color : HandprintTheme.ink
    }
}

struct ActionButtonRow: View {
    let primaryTitle: String
    let primaryIcon: String
    let secondaryTitle: String
    let secondaryIcon: String
    var primaryTint = HandprintTheme.moss
    var secondaryTint = HandprintTheme.tide
    var primaryAction: () -> Void
    var secondaryAction: () -> Void

    var body: some View {
        VStack(spacing: 10) {
            Button(action: primaryAction) {
                Label(primaryTitle, systemImage: primaryIcon)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(primaryTint)

            Button(action: secondaryAction) {
                Label(secondaryTitle, systemImage: secondaryIcon)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .tint(secondaryTint)
        }
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
