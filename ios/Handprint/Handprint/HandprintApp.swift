import SwiftUI

@main
struct HandprintApp: App {
    @StateObject private var store: HandprintStore

    init() {
        let initialStore = HandprintStore()
        if ProcessInfo.processInfo.arguments.contains("-ui-testing-reset") {
            initialStore.resetLocalState()
        }
        initialStore.configureForUITesting(arguments: ProcessInfo.processInfo.arguments)
        _store = StateObject(wrappedValue: initialStore)
    }

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
