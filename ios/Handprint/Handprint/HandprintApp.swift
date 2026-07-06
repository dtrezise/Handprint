import SwiftUI

@main
struct HandprintApp: App {
    @StateObject private var store = HandprintStore()

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environmentObject(store)
                .onOpenURL { url in
                    store.handleDeepLink(url)
                }
        }
    }
}
