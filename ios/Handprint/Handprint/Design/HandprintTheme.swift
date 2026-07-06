import SwiftUI

enum HandprintTheme {
    static let ink = Color(red: 0.09, green: 0.09, blue: 0.09)
    static let paper = Color(red: 0.98, green: 0.97, blue: 0.95)
    static let moss = Color(red: 0.31, green: 0.44, blue: 0.32)
    static let tide = Color(red: 0.12, green: 0.48, blue: 0.55)
    static let coral = Color(red: 0.85, green: 0.40, blue: 0.30)
    static let plum = Color(red: 0.44, green: 0.30, blue: 0.49)
    static let gold = Color(red: 0.79, green: 0.60, blue: 0.21)
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
        case .preparedness: HandprintTheme.moss
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
        case .preparedness: "hands.sparkles"
        }
    }
}

extension View {
    func handprintCard() -> some View {
        self
            .padding(16)
            .background(.white.opacity(0.92), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(.black.opacity(0.08), lineWidth: 1)
            )
    }
}
