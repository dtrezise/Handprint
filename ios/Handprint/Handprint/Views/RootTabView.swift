import SwiftUI

struct RootTabView: View {
    @EnvironmentObject private var store: HandprintStore

    var body: some View {
        Group {
            if store.isOnboarded {
                TabView(selection: $store.activeTab) {
                    DiscoverView()
                        .tabItem {
                            Label("Discover", systemImage: "sparkle.magnifyingglass")
                        }
                        .tag(AppTab.discover)

                    HandprintProfileView()
                        .tabItem {
                            Label("Handprint", systemImage: "hand.raised")
                        }
                        .tag(AppTab.handprint)

                    ShareHandprintView()
                        .tabItem {
                            Label("Share", systemImage: "square.and.arrow.up")
                        }
                        .tag(AppTab.share)

                    OrganizeView()
                        .tabItem {
                            Label("Organize", systemImage: "plus.app")
                        }
                        .tag(AppTab.organize)

                    ReviewQueueView()
                        .tabItem {
                            Label("Review", systemImage: "checkmark.shield")
                        }
                        .tag(AppTab.review)
                }
                .tint(HandprintTheme.tide)
            } else {
                OnboardingView()
            }
        }
    }
}
