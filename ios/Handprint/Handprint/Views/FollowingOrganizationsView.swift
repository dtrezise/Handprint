@preconcurrency import CoreMotion
@preconcurrency import MultipeerConnectivity
import SwiftUI
import UIKit

struct FollowingOrganizationsView: View {
    @EnvironmentObject private var store: HandprintStore
    @State private var query = ""
    @State private var networkFilter = "All"
    @State private var selectedWorldChanger: FollowedWorldChanger?
    @State private var showingProfileSettings = false

    private var filteredOrganizations: [OrganizerImpactProfile] {
        let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard networkFilter == "All" || networkFilter == "World Enablers" else { return [] }
        guard !normalized.isEmpty else { return store.followedOrganizations }
        return store.followedOrganizations.filter {
            $0.name.lowercased().contains(normalized) ||
                $0.publicSummary.lowercased().contains(normalized) ||
                $0.type.lowercased().contains(normalized)
        }
    }

    private var suggestedOrganizations: [OrganizerImpactProfile] {
        let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard networkFilter == "All" || networkFilter == "World Enablers" else { return [] }
        let base = store.organizerProfiles.filter { $0.savedByViewer != true }
        guard !normalized.isEmpty else { return Array(base.prefix(3)) }
        return base.filter {
            $0.name.lowercased().contains(normalized) ||
                $0.publicSummary.lowercased().contains(normalized) ||
                $0.type.lowercased().contains(normalized)
        }
    }

    private var filteredWorldChangers: [FollowedWorldChanger] {
        let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard networkFilter == "All" || networkFilter == "World Changers" || networkFilter == "Recruiting" else { return [] }
        let base = store.savedWorldChangers.filter { worldChanger in
            networkFilter != "Recruiting" || !worldChanger.recruiting.isEmpty
        }
        guard !normalized.isEmpty else { return base }
        return base.filter {
            $0.name.lowercased().contains(normalized) ||
                $0.focus.lowercased().contains(normalized) ||
                $0.recruiting.joined(separator: " ").lowercased().contains(normalized)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(eyebrow: "Shake", title: "Connect while you are together", systemImage: "hands.clap")

                    ShakeListeningCard()

                    VStack(alignment: .leading, spacing: 10) {
                        CompactHeader(
                            title: "After the Shake",
                            subtitle: "The people and World Enablers you meet become a useful network for what comes next.",
                            systemImage: "point.3.connected.trianglepath.dotted"
                        )
                        MetricStrip(metrics: [
                            ("\(store.followedOrganizations.count)", "Enablers", "building.2"),
                            ("\(store.savedWorldChangers.count)", "Changers", "person.2")
                        ])
                    }
                    .handprintCard()

                    VStack(alignment: .leading, spacing: 10) {
                        DarkField(placeholder: "Search your Shake network", text: $query)
                        Picker("Network filter", selection: $networkFilter) {
                            Text("All").tag("All")
                            Text("Enablers").tag("World Enablers")
                            Text("Changers").tag("World Changers")
                            Text("Recruiting").tag("Recruiting")
                        }
                        .pickerStyle(.segmented)
                    }
                    .handprintCard()

                    switch store.organizationLoadState {
                    case .loading:
                        StateCard(title: "Loading World Enablers", message: "Refreshing saved World Enabler Handprints.", systemImage: "arrow.triangle.2.circlepath")
                    case .error:
                        StateCard(title: "World Enablers unavailable", message: "Showing saved World Enablers while Handprint reconnects.", systemImage: "wifi.exclamationmark")
                    case .empty:
                        StateCard(title: "No World Enablers yet", message: "Follow a World Enabler from an event detail screen to keep their next useful actions close.", systemImage: "building.2")
                    case .ready:
                        EmptyView()
                    }

                    if store.organizationLoadState == .ready && filteredOrganizations.isEmpty {
                        StateCard(
                            title: query.isEmpty ? "No saved World Enablers" : "No matching World Enablers",
                            message: query.isEmpty
                                ? "Open an event, choose its World Enabler Handprint, then follow it here."
                                : "Try another name or show all of your Shake network.",
                            systemImage: "heart"
                        )
                    } else {
                        Text("Saved World Enablers")
                            .font(.headline)
                        ForEach(filteredOrganizations) { organizer in
                            NavigationLink(value: organizer) {
                                OrganizationFollowCard(organizer: organizer)
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if !suggestedOrganizations.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Label("Suggested World Enablers", systemImage: "sparkles")
                                .font(.headline)
                            ForEach(suggestedOrganizations) { organizer in
                                NavigationLink(value: organizer) {
                                    OrganizationFollowCard(organizer: organizer)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Label("World Changers to watch", systemImage: "person.crop.circle.badge.checkmark")
                            .font(.headline)
                        if filteredWorldChangers.isEmpty {
                            Text("Follow a World Changer from a public Handprint to see who they are recruiting, hosting, or joining.")
                                .font(.subheadline)
                                .foregroundStyle(HandprintTheme.muted)
                        } else {
                            ForEach(filteredWorldChangers) { worldChanger in
                                WorldChangerFollowCard(worldChanger: worldChanger) {
                                    selectedWorldChanger = worldChanger
                                }
                            }
                        }
                    }
                    .handprintCard()
                }
                .padding(14)
            }
            .handprintScreenBackground()
            .navigationTitle("Shake")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    ProfileSettingsButton { showingProfileSettings = true }
                }
            }
            .navigationDestination(for: OrganizerImpactProfile.self) { organizer in
                OrganizationHandprintView(organizer: organizer)
            }
            .navigationDestination(for: ImpactReceipt.self) { receipt in
                ImpactReceiptDetailView(receipt: receipt)
            }
            .sheet(item: $selectedWorldChanger) { worldChanger in
                WorldChangerDetailSheet(worldChanger: worldChanger)
            }
            .sheet(isPresented: $showingProfileSettings) {
                ProfileSettingsPage()
                    .environmentObject(store)
            }
        }
        .handprintKeyboardControls()
    }
}

private struct ShakeIdentity: Codable, Equatable {
    let handle: String
    let name: String
}

@MainActor
private final class ShakeConnectionService: NSObject, ObservableObject {
    @Published private(set) var isListening = false
    @Published private(set) var status = "Starting nearby listening..."
    @Published private(set) var connectedIdentity: ShakeIdentity?

    private let serviceType = "handprint-shake"
    private let localPeer = MCPeerID(displayName: "Handprint-\(UUID().uuidString.prefix(6))")
    private lazy var session = MCSession(peer: localPeer, securityIdentity: nil, encryptionPreference: .required)
    private lazy var advertiser = MCNearbyServiceAdvertiser(peer: localPeer, discoveryInfo: nil, serviceType: serviceType)
    private lazy var browser = MCNearbyServiceBrowser(peer: localPeer, serviceType: serviceType)
    private let motionManager = CMMotionManager()
    private var identity = ShakeIdentity(handle: "handprint-user", name: "World Changer")
    private var nearbyPeers: [MCPeerID] = []
    private var lastShakeAt = Date.distantPast

    override init() {
        super.init()
        session.delegate = self
        advertiser.delegate = self
        browser.delegate = self
    }

    func start(identity: ShakeIdentity) {
        self.identity = identity
        guard !isListening else { return }
        isListening = true
        status = "Listening for another Handprint"
        advertiser.startAdvertisingPeer()
        browser.startBrowsingForPeers()
        startMotionDetection()
    }

    func stop() {
        isListening = false
        status = "Shake paused"
        motionManager.stopAccelerometerUpdates()
        advertiser.stopAdvertisingPeer()
        browser.stopBrowsingForPeers()
    }

    func signalShake() {
        let now = Date()
        guard now.timeIntervalSince(lastShakeAt) > 1.2 else { return }
        lastShakeAt = now
        status = nearbyPeers.isEmpty ? "Shake detected - looking nearby" : "Shake detected - connecting"
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        nearbyPeers.forEach { peer in
            browser.invitePeer(peer, to: session, withContext: nil, timeout: 12)
        }
    }

    private func startMotionDetection() {
        guard motionManager.isAccelerometerAvailable else { return }
        motionManager.accelerometerUpdateInterval = 0.15
        motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, _ in
            guard let self, let acceleration = data?.acceleration else { return }
            let force = sqrt(acceleration.x * acceleration.x + acceleration.y * acceleration.y + acceleration.z * acceleration.z)
            if force > 2.1 { self.signalShake() }
        }
    }

    private func sendIdentity() {
        guard !session.connectedPeers.isEmpty, let data = try? JSONEncoder().encode(identity) else { return }
        try? session.send(data, toPeers: session.connectedPeers, with: .reliable)
    }
}

extension ShakeConnectionService: @preconcurrency MCNearbyServiceAdvertiserDelegate {
    func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
        invitationHandler(true, session)
    }
}

extension ShakeConnectionService: @preconcurrency MCNearbyServiceBrowserDelegate {
    func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String: String]?) {
        guard peerID != localPeer, !nearbyPeers.contains(peerID) else { return }
        nearbyPeers.append(peerID)
        DispatchQueue.main.async { self.status = "Another Handprint is nearby - gently shake" }
    }

    func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
        nearbyPeers.removeAll { $0 == peerID }
    }
}

extension ShakeConnectionService: @preconcurrency MCSessionDelegate {
    func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
        DispatchQueue.main.async {
            switch state {
            case .connected:
                self.status = "Connected - exchanging Handprints"
                self.sendIdentity()
            case .connecting:
                self.status = "Connecting Handprints"
            case .notConnected:
                if self.isListening { self.status = "Listening for another Handprint" }
            @unknown default:
                self.status = "Listening for another Handprint"
            }
        }
    }

    func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
        guard let identity = try? JSONDecoder().decode(ShakeIdentity.self, from: data) else { return }
        DispatchQueue.main.async {
            self.connectedIdentity = identity
            self.status = "Connected with \(identity.name)"
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
    }

    func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {}
    func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {}
    func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {}
}

private struct ShakeListeningCard: View {
    @EnvironmentObject private var store: HandprintStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @StateObject private var connection = ShakeConnectionService()
    @State private var pulse = false

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .stroke(HandprintTheme.tide.opacity(0.35), lineWidth: 2)
                        .frame(width: 76, height: 76)
                        .scaleEffect(pulse && connection.isListening ? 1.35 : 0.75)
                        .opacity(pulse && connection.isListening ? 0 : 0.8)
                    Circle()
                        .fill(connection.isListening ? HandprintTheme.tide : HandprintTheme.field)
                        .frame(width: 58, height: 58)
                    Image(systemName: connection.connectedIdentity == nil ? "wave.3.right" : "hands.clap.fill")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(connection.isListening ? .white : HandprintTheme.muted)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(connection.connectedIdentity == nil ? "Listening for a Shake" : "Shake connected")
                        .font(.headline)
                    Text(connection.status)
                        .font(.subheadline)
                        .foregroundStyle(HandprintTheme.muted)
                }
            }

            if let identity = connection.connectedIdentity {
                Button {
                    store.saveShakeConnection(handle: identity.handle, name: identity.name)
                } label: {
                    Label("Add \(identity.name) to my network", systemImage: "person.crop.circle.badge.plus")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(HandprintTheme.moss)
            } else {
                HStack(spacing: 10) {
                    Button {
                        connection.signalShake()
                    } label: {
                        Label("I shook my phone", systemImage: "iphone.radiowaves.left.and.right")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(HandprintTheme.tide)

                    Button(connection.isListening ? "Pause" : "Listen") {
                        if connection.isListening {
                            connection.stop()
                        } else {
                            connection.start(identity: ShakeIdentity(handle: store.profile.handle, name: store.profile.name))
                        }
                    }
                    .buttonStyle(.bordered)
                }
            }

            Text("Shake only exchanges your public Handprint identity. It does not share your phone number, email, or precise location.")
                .font(.caption)
                .foregroundStyle(HandprintTheme.muted)
        }
        .handprintCard()
        .onAppear {
            connection.start(identity: ShakeIdentity(handle: store.profile.handle, name: store.profile.name))
            if reduceMotion {
                pulse = false
            } else {
                withAnimation(.easeOut(duration: 1.5).repeatForever(autoreverses: false)) { pulse = true }
            }
        }
        .onDisappear { connection.stop() }
    }
}

private struct WorldChangerFollowCard: View {
    @EnvironmentObject private var store: HandprintStore
    let worldChanger: FollowedWorldChanger
    var openDetail: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "hand.raised.fill")
                    .foregroundStyle(HandprintTheme.coralBright)
                    .frame(width: 34, height: 34)
                    .background(HandprintTheme.coral.opacity(0.12), in: RoundedRectangle(cornerRadius: 10, style: .continuous))

                VStack(alignment: .leading, spacing: 3) {
                    Text(worldChanger.name)
                        .font(.subheadline.weight(.semibold))
                    Text("@\(worldChanger.handle) - \(worldChanger.tier) - \(worldChanger.focus)")
                        .font(.caption)
                        .foregroundStyle(HandprintTheme.muted)
                }

                Spacer()

                Button {
                    store.toggleFollow(worldChanger)
                } label: {
                    Image(systemName: worldChanger.savedByViewer ? "heart.fill" : "heart")
                        .foregroundStyle(worldChanger.savedByViewer ? HandprintTheme.coral : HandprintTheme.muted)
                }
                .buttonStyle(.borderless)
                .accessibilityLabel(worldChanger.savedByViewer ? "Unfollow \(worldChanger.name)" : "Follow \(worldChanger.name)")
            }
            .contentShape(Rectangle())
            .onTapGesture(perform: openDetail)

            Text("Recruiting: \(worldChanger.recruiting.prefix(2).joined(separator: ", "))")
                .font(.caption.weight(.semibold))
                .foregroundStyle(HandprintTheme.tideBright)

            FlowLayout(spacing: 8) {
                Label("\(worldChanger.points) pts", systemImage: "trophy")
                Label("Open QR Handprint", systemImage: "qrcode")
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(HandprintTheme.muted)
        }
        .padding(10)
        .background(HandprintTheme.paper, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct WorldChangerDetailSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: HandprintStore
    let worldChanger: FollowedWorldChanger

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(alignment: .leading, spacing: 10) {
                        Image(systemName: "hand.raised.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(HandprintTheme.coralBright)
                        Text(worldChanger.name)
                            .font(.title.bold())
                        Text("@\(worldChanger.handle) - \(worldChanger.tier)")
                            .font(.headline)
                            .foregroundStyle(HandprintTheme.tideBright)
                        Text(worldChanger.focus)
                            .font(.subheadline)
                            .foregroundStyle(HandprintTheme.muted)
                    }
                    .handprintCard()

                    MetricStrip(metrics: [
                        ("\(worldChanger.points)", "WC points", "trophy"),
                        ("\(worldChanger.recruiting.count)", "Recruiting", "person.crop.circle.badge.plus")
                    ])

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Recruiting now")
                            .font(.headline)
                        ForEach(worldChanger.recruiting, id: \.self) { item in
                            Label(item, systemImage: "arrowshape.turn.up.right")
                                .font(.subheadline.weight(.semibold))
                        }
                    }
                    .handprintCard()

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Following")
                            .font(.headline)
                        ForEach(worldChanger.following, id: \.self) { item in
                            Label(item, systemImage: "building.2")
                                .font(.subheadline.weight(.semibold))
                        }
                    }
                    .handprintCard()

                    Button {
                        store.toggleFollow(worldChanger)
                        dismiss()
                    } label: {
                        Label(worldChanger.savedByViewer ? "Remove from Shake network" : "Add to Shake network", systemImage: worldChanger.savedByViewer ? "heart.slash" : "heart")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(worldChanger.savedByViewer ? HandprintTheme.coral : HandprintTheme.tide)
                }
                .padding(18)
            }
            .handprintScreenBackground()
            .navigationTitle("World Changer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                Button("Done") { dismiss() }
            }
        }
        .handprintKeyboardControls()
    }
}

private struct OrganizationFollowCard: View {
    @EnvironmentObject private var store: HandprintStore
    let organizer: OrganizerImpactProfile

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 5) {
                    Text(organizer.trustTier.rawValue)
                        .font(.caption.weight(.bold))
                        .textCase(.uppercase)
                        .foregroundStyle(HandprintTheme.mossBright)
                    Text(organizer.name)
                        .font(.headline)
                    Text(organizer.publicSummary)
                        .font(.subheadline)
                        .foregroundStyle(HandprintTheme.muted)
                }
                Spacer()
                Button {
                    store.toggleFollow(organizer)
                } label: {
                    Image(systemName: organizer.savedByViewer == true ? "heart.fill" : "heart")
                        .foregroundStyle(organizer.savedByViewer == true ? HandprintTheme.coral : HandprintTheme.muted)
                }
                .buttonStyle(.borderless)
                .accessibilityLabel(organizer.savedByViewer == true ? "Unfollow \(organizer.name)" : "Follow \(organizer.name)")
            }

            MetricStrip(metrics: [
                ("\(organizer.confirmedParticipants)", "Confirmed", "checkmark.seal"),
                ("\(organizer.impactReceiptIds.count)", "Receipts", "doc.badge.checkmark")
            ])
        }
        .handprintCard()
    }
}

private struct StateCard: View {
    let title: String
    let message: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: systemImage)
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(HandprintTheme.muted)
        }
        .handprintCard()
    }
}
