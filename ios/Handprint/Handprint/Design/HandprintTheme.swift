import SwiftUI

enum HandprintTheme {
    static let ink = Color(red: 0.98, green: 0.97, blue: 0.95)
    static let background = Color(red: 0.03, green: 0.04, blue: 0.04)
    static let surface = Color(red: 0.06, green: 0.09, blue: 0.08)
    static let paper = Color(red: 0.09, green: 0.14, blue: 0.12)
    static let field = Color(red: 0.03, green: 0.05, blue: 0.05).opacity(0.88)
    static let border = Color(red: 0.98, green: 0.97, blue: 0.95).opacity(0.11)
    static let muted = Color(red: 0.98, green: 0.97, blue: 0.95).opacity(0.68)
    static let moss = Color(red: 0.31, green: 0.44, blue: 0.32)
    static let mossBright = Color(red: 0.47, green: 0.71, blue: 0.49)
    static let tide = Color(red: 0.12, green: 0.48, blue: 0.55)
    static let tideBright = Color(red: 0.34, green: 0.71, blue: 0.77)
    static let tideSoft = Color(red: 0.31, green: 0.48, blue: 0.55)
    static let coral = Color(red: 0.85, green: 0.40, blue: 0.30)
    static let coralBright = Color(red: 0.94, green: 0.54, blue: 0.45)
    static let plum = Color(red: 0.44, green: 0.30, blue: 0.49)
    static let gold = Color(red: 0.79, green: 0.60, blue: 0.21)
    static let goldBright = Color(red: 0.91, green: 0.73, blue: 0.34)
}

extension EventCategory {
    var color: Color {
        switch self {
        case .foodSupport: HandprintTheme.coral
        case .cleanup: HandprintTheme.moss
        case .mentoring: HandprintTheme.plum
        case .mutualAid: HandprintTheme.tide
        case .civicForum: HandprintTheme.gold
        case .artsCommunity: HandprintTheme.coral
        case .preparedness: Color(red: 0.57, green: 0.39, blue: 0.23)
        case .communityService: Color(red: 0.48, green: 0.54, blue: 0.85)
        }
    }

    var symbolName: String {
        switch self {
        case .foodSupport: "takeoutbag.and.cup.and.straw"
        case .cleanup: "leaf"
        case .mentoring: "heart.text.square"
        case .mutualAid: "shield.checkered"
        case .civicForum: "megaphone"
        case .artsCommunity: "paintbrush"
        case .preparedness: "backpack"
        case .communityService: "scale.3d"
        }
    }
}

extension View {
    func handprintCard() -> some View {
        modifier(HandprintCardModifier())
    }

    func handprintScreenBackground() -> some View {
        self
            .background(
                LinearGradient(
                    colors: [
                        Color(red: 0.05, green: 0.09, blue: 0.08),
                        HandprintTheme.background,
                        Color(red: 0.02, green: 0.03, blue: 0.02)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
    }
}

private struct HandprintCardModifier: ViewModifier {
    @Environment(\.colorSchemeContrast) private var colorSchemeContrast

    func body(content: Content) -> some View {
        content
            .padding(14)
            .background(HandprintTheme.surface.opacity(colorSchemeContrast == .increased ? 1 : 0.96), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(colorSchemeContrast == .increased ? HandprintTheme.ink.opacity(0.42) : HandprintTheme.border, lineWidth: colorSchemeContrast == .increased ? 2 : 1)
            )
    }
}
