import SwiftUI
import UIKit

struct RootTabView: View {
    @EnvironmentObject private var store: HandprintStore

    var body: some View {
        Group {
            if store.isOnboarded {
                HandprintShell()
            } else {
                OnboardingView()
            }
        }
        .preferredColorScheme(.dark)
    }
}

private struct HandprintShell: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private let tabs: [HandprintTabItem] = [
        HandprintTabItem(tab: .reach, title: "Reach", systemImage: "scope"),
        HandprintTabItem(tab: .print, title: "Print", systemImage: "hand.raised"),
        HandprintTabItem(tab: .wave, title: "Wave", systemImage: "hand.wave"),
        HandprintTabItem(tab: .shake, title: "Shake", systemImage: "hands.clap")
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            activeScreen
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.bottom, dynamicTypeSize.isAccessibilitySize ? 108 : 84)

            CustomHandprintTabBar(tabs: tabs, selectedTab: $store.activeTab)
        }
        .background(HandprintTheme.background.ignoresSafeArea())
    }

    @ViewBuilder
    private var activeScreen: some View {
        switch store.activeTab {
        case .reach:
            DiscoverView()
        case .print:
            HandprintProfileView()
        case .wave:
            ShareHandprintView()
        case .shake:
            FollowingOrganizationsView()
        case .enable:
            OrganizeView()
        case .review:
            ReviewQueueView()
        }
    }
}

private struct HandprintTabItem: Identifiable {
    var id: AppTab { tab }
    let tab: AppTab
    let title: String
    let systemImage: String
}

private struct CustomHandprintTabBar: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let tabs: [HandprintTabItem]
    @Binding var selectedTab: AppTab

    var body: some View {
        HStack(spacing: 4) {
            ForEach(tabs) { item in
                Button {
                    if reduceMotion {
                        selectedTab = item.tab
                    } else {
                        withAnimation(.snappy(duration: 0.22)) {
                            selectedTab = item.tab
                        }
                    }
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: item.systemImage)
                            .font(.headline.weight(.semibold))
                        Text(item.title)
                            .font(.caption2.bold())
                            .lineLimit(2)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: dynamicTypeSize.isAccessibilitySize ? 76 : 58)
                    .foregroundStyle(selectedTab == item.tab ? HandprintTheme.tide : HandprintTheme.muted)
                    .background(selectedTab == item.tab ? HandprintTheme.tide.opacity(0.14) : Color.clear, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("tab-\(item.title.lowercased())")
                .accessibilityLabel(item.title)
                .accessibilityValue(selectedTab == item.tab ? "Selected" : "")
                .accessibilityAddTraits(selectedTab == item.tab ? .isSelected : [])
            }
        }
        .padding(.horizontal, 10)
        .padding(.top, 8)
        .padding(.bottom, 12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .stroke(HandprintTheme.border, lineWidth: 1)
        )
        .padding(.horizontal, 10)
        .padding(.bottom, 8)
    }
}
