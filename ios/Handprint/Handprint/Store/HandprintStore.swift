import CoreLocation
import Foundation

@MainActor
final class HandprintStore: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var profile = MockHandprintData.profile
    @Published var actions = MockHandprintData.actions
    @Published var marks = MockHandprintData.marks
    @Published var organizerProfiles = MockHandprintData.organizerProfiles
    @Published var impactReceipts = MockHandprintData.impactReceipts
    @Published var followedWorldChangers = MockHandprintData.followedWorldChangers
    @Published var reachRewards = MockHandprintData.reachRewards
    @Published var trainingCredentials = MockHandprintData.trainingCredentials
    @Published var organizationLoadState: RemoteCollectionState = .ready
    @Published var receiptLoadState: RemoteCollectionState = .ready
    @Published var socialLoadState: RemoteCollectionState = .ready
    @Published var socialStatus = "Wave is ready"
    @Published var rsvps: [String: RsvpStatus] = ["tenant-rights-clinic": .checkedIn]
    @Published var reports: [EventReport] = []
    @Published var selectedActionId = MockHandprintData.actions.first?.id ?? ""
    @Published var activeTab: AppTab = .reach
    @Published var isOnboarded = false
    @Published var authState: AuthState = .appleReady
    @Published var locationPermission: LocationPermissionState = .notRequested
    @Published var openedPublicHandle: String?
    @Published var loadedPublicProfile: PublicHandprintPayload?
    @Published var lastReportConfirmation: ReportConfirmation?
    @Published private(set) var backendConfiguration = BackendConfiguration.localMock
    @Published private(set) var syncStatus = "Handprint is ready"

    private let persistenceKey = "handprint.ios.localState.v1"
    private let apiClient: HandprintAPIClient
    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()

    override init() {
        let configuration = BackendConfiguration.fromBundle()
        backendConfiguration = configuration
        apiClient = HandprintAPIClient(configuration: configuration)
        super.init()
        locationManager.delegate = self
        syncStatus = configuration.usesMockData ? "Handprint is ready" : "Ready to sync"
        restore()
    }

    var shareURL: URL {
        publicURL(path: "u/\(profile.handle)")
    }

    func publicURL(path: String) -> URL {
        let baseURL = backendConfiguration.baseURL ?? URL(string: "http://127.0.0.1:3000")!
        return baseURL.appending(path: path)
    }

    var selectedAction: LocalAction {
        actions.first(where: { $0.id == selectedActionId }) ?? actions[0]
    }

    var recommendations: [Recommendation] {
        actions
            .filter { $0.status != .rejected }
            .map { score(action: $0) }
            .sorted { $0.score > $1.score }
    }

    var completedActions: [(mark: HandprintMark, action: LocalAction?)] {
        marks.map { mark in
            (mark, actions.first(where: { $0.id == mark.eventId }))
        }
    }

    var nextJoinableActions: [LocalAction] {
        actions
            .filter { $0.status == .approved }
            .filter { action in !marks.contains(where: { $0.eventId == action.id }) }
            .prefix(3)
            .map { $0 }
    }

    var pendingReviewActions: [LocalAction] {
        actions.filter { $0.status == .pending || $0.status == .escalated }
    }

    func organizer(for action: LocalAction) -> OrganizerImpactProfile? {
        let actionOrganizer = action.organizer.lowercased()
        return organizerProfiles.first { organizer in
            let name = organizer.name.lowercased()
            return name == actionOrganizer || name.contains(actionOrganizer) || actionOrganizer.contains(name)
        }
    }

    func receipts(for organizer: OrganizerImpactProfile) -> [ImpactReceipt] {
        impactReceipts.filter { organizer.impactReceiptIds.contains($0.id) }
    }

    var openReports: [EventReport] {
        reports.filter { $0.status == "open" }
    }

    var followedOrganizations: [OrganizerImpactProfile] {
        organizerProfiles.filter { $0.savedByViewer == true }
    }

    var savedWorldChangers: [FollowedWorldChanger] {
        followedWorldChangers.filter(\.savedByViewer)
    }

    var rewardsEnabled: Bool {
        profile.rewardsEnabled ?? true
    }

    var worldChangerPoints: Int {
        marks.reduce(0) { total, mark in
            if mark.source == "Organizer confirmed" { return total + 125 }
            if mark.source == "Check-in" { return total + 70 }
            return total + 20
        }
    }

    var worldChangerTier: String {
        switch worldChangerPoints {
        case 900...: "Anchor"
        case 520...: "Builder"
        case 260...: "Helper"
        case 120...: "Neighbor"
        default: "Starter"
        }
    }

    func completeOnboarding(profile updatedProfile: UserProfile) {
        profile = updatedProfile
        isOnboarded = true
        authState = .signedIn
        persist()
    }

    func requestApproximateLocation() {
        locationManager.desiredAccuracy = kCLLocationAccuracyThreeKilometers
        locationPermission = .approximateAllowed
        if let currentLocation = locationManager.location {
            Task {
                await updateApproximateCommunity(from: currentLocation)
            }
        }
        switch locationManager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            locationManager.requestLocation()
            syncStatus = "Locating approximate area..."
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
            syncStatus = "Requesting location permission..."
        case .denied, .restricted:
            locationPermission = .denied
            syncStatus = "Location permission denied. Using saved default area."
        @unknown default:
            locationManager.requestWhenInUseAuthorization()
            syncStatus = "Requesting location permission..."
        }
        persist()
    }

    func continueWithoutLocation() {
        locationPermission = .denied
        persist()
    }

    func updateProfileSettings(location: String? = nil, radiusMiles: Double? = nil, rewardsEnabled: Bool? = nil) {
        if let location {
            profile.launchCommunity = location
        }
        if let radiusMiles {
            profile.radiusMiles = radiusMiles
        }
        if let rewardsEnabled {
            profile.rewardsEnabled = rewardsEnabled
        }
        persist()
        let nextProfile = profile
        Task {
            do {
                try await apiClient.updateProfileSettings(profile: nextProfile)
                await MainActor.run { syncStatus = "Profile settings synced" }
            } catch {
                await MainActor.run { syncStatus = "Profile settings saved locally" }
            }
        }
    }

    func updateProfileIdentity(name: String, handle: String) {
        let cleanedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanedHandle = handle
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "@", with: "")
            .replacingOccurrences(of: " ", with: "-")
            .lowercased()
        profile.name = cleanedName.isEmpty ? profile.name : cleanedName
        profile.handle = cleanedHandle.isEmpty ? profile.handle : cleanedHandle
        persistProfileChange()
    }

    func toggleInterest(_ category: EventCategory) {
        if profile.interests.contains(category) {
            profile.interests.remove(category)
        } else {
            profile.interests.insert(category)
        }
        persistProfileChange()
    }

    func clearInterests() {
        profile.interests.removeAll()
        persistProfileChange()
    }

    func toggleSkill(_ skill: String) {
        if profile.skills.contains(skill) {
            profile.skills.remove(skill)
        } else {
            profile.skills.insert(skill)
        }
        persistProfileChange()
    }

    func clearSkills() {
        profile.skills.removeAll()
        persistProfileChange()
    }

    func toggleAvailability(_ availability: String) {
        if profile.availability.contains(availability) {
            profile.availability.remove(availability)
        } else {
            profile.availability.insert(availability)
        }
        persistProfileChange()
    }

    func updateCredential(_ credential: TrainingCredential, uploadState: String, status: String, confidence: String? = nil) {
        guard let index = trainingCredentials.firstIndex(where: { $0.id == credential.id }) else { return }
        trainingCredentials[index].uploadState = uploadState
        trainingCredentials[index].status = status
        if let confidence {
            trainingCredentials[index].confidence = confidence
        }
        syncStatus = "\(credential.title) credential updated"
        persist()
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        Task { @MainActor in
            await updateApproximateCommunity(from: location)
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            locationPermission = .denied
            syncStatus = "Location unavailable. Using saved default area."
            persist()
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        Task { @MainActor in
            switch status {
            case .authorizedAlways, .authorizedWhenInUse:
                locationPermission = .approximateAllowed
                locationManager.requestLocation()
            case .denied, .restricted:
                locationPermission = .denied
                syncStatus = "Location permission denied. Using saved default area."
                persist()
            default:
                break
            }
        }
    }

    func handleDeepLink(_ url: URL) {
        if url.scheme == "handprint", url.host == "shake" {
            activeTab = .shake
            return
        }
        let components = url.pathComponents.filter { $0 != "/" }
        if url.scheme == "handprint", url.host == "u", let handle = components.first {
            openedPublicHandle = handle
            activeTab = handle == profile.handle ? .wave : .print
            loadPublicProfile(handle: handle)
            return
        }

        if components.first == "u", let handle = components.dropFirst().first {
            openedPublicHandle = handle
            activeTab = handle == profile.handle ? .wave : .print
            loadPublicProfile(handle: handle)
        }
    }

    func score(action: LocalAction) -> Recommendation {
        var score = 0.0
        var reasons: [String] = []

        if action.distanceMiles <= profile.radiusMiles {
            score += max(0, 30 - action.distanceMiles / 3)
            reasons.append(action.distanceMiles <= 3 ? "Very near you" : "Within your reach")
        }

        if profile.interests.contains(action.category) {
            score += 24
            reasons.append("Matches \(action.category.rawValue.lowercased())")
        }

        let matchedSkills = action.skills.filter { profile.skills.contains($0) }
        if !matchedSkills.isEmpty {
            score += Double(matchedSkills.count * 12)
            reasons.append("Uses \(matchedSkills.prefix(2).joined(separator: " + "))")
        }

        if profile.availability.contains(action.daypart) {
            score += 16
            reasons.append(action.daypart)
        }

        switch action.trustTier {
        case .anchorPartner:
            score += 18
            reasons.append("Anchor World Enabler")
        case .verified:
            score += 12
            reasons.append("Verified World Enabler")
        case .pendingReview:
            score -= 18
            reasons.append("Needs trust review")
        case .escalated:
            score -= 24
            reasons.append("Escalated")
        }

        switch action.status {
        case .approved:
            score += 8
        case .pending:
            score -= 6
        case .escalated:
            score -= 24
        case .rejected:
            score -= 48
        }

        return Recommendation(action: action, score: Int(score.rounded()), reasons: Array(reasons.prefix(5)))
    }

    func setRSVP(_ status: RsvpStatus, for action: LocalAction) {
        selectedActionId = action.id
        rsvps[action.id] = status
        upsertMark(for: action, status: status)
        persist()
        postRSVP(status, for: action)
    }

    func approve(_ action: LocalAction) {
        update(action, status: .approved, trustTier: .verified, reviewNote: "Approved for pilot listing.")
        persist()
        postReviewDecision(.approved, for: action)
    }

    func escalate(_ action: LocalAction) {
        update(action, status: .escalated, trustTier: .escalated, reviewNote: "Requires additional review before public listing.")
        persist()
        postReviewDecision(.escalated, for: action)
    }

    func reject(_ action: LocalAction) {
        update(action, status: .rejected, trustTier: .escalated, reviewNote: "Rejected from pilot listing. Organizer can revise and resubmit.")
        persist()
        postReviewDecision(.rejected, for: action)
    }

    func report(_ action: LocalAction, reason: EventReportReason, note: String) {
        let report = EventReport(
            id: "report-\(action.id)-\(Date().timeIntervalSince1970)",
            eventId: action.id,
            reason: reason,
            note: note.trimmingCharacters(in: .whitespacesAndNewlines),
            createdAt: Date(),
            status: "open"
        )
        reports.insert(report, at: 0)
        update(action, status: .escalated, trustTier: .escalated, reviewNote: "User report: \(reason.rawValue).")
        lastReportConfirmation = ReportConfirmation(
            reportId: report.id,
            actionTitle: action.title,
            message: "Thanks. This went to the trust queue and the action was escalated for review."
        )
        persist()
        postReport(report)
    }

    func reviewSocialText(_ text: String, surface: String) async throws -> AffirmationReview {
        try await apiClient.reviewSocialText(text, surface: surface)
    }

    func saveShareDraft(platformId: String, message: String) async throws {
        try await apiClient.saveShareDraft(platformId: platformId, message: message)
        socialStatus = "Draft saved"
    }

    func postSocialComment(targetType: String, targetId: String, text: String) async throws {
        try await apiClient.postSocialComment(targetType: targetType, targetId: targetId, text: text)
        socialStatus = "Comment queued"
    }

    func submit(_ draft: OrganizerDraft) {
        guard draft.isSubmittable else { return }

        let skills = draft.skills
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }

        let needsEscalation = draft.summary.localizedCaseInsensitiveContains("youth") ||
            draft.summary.localizedCaseInsensitiveContains("school") ||
            draft.summary.localizedCaseInsensitiveContains("fundraiser") ||
            draft.summary.localizedCaseInsensitiveContains("medical") ||
            draft.summary.localizedCaseInsensitiveContains("campaign")

        let newAction = LocalAction(
            id: "draft-\(Date().timeIntervalSince1970)",
            title: draft.title,
            summary: draft.summary,
            category: draft.category,
            organizer: draft.organizer,
            trustTier: needsEscalation ? .escalated : .pendingReview,
            status: needsEscalation ? .escalated : .pending,
            neighborhood: draft.neighborhood.isEmpty ? profile.launchCommunity : draft.neighborhood,
            distanceMiles: 2.6,
            startsAt: draft.startsAt.isEmpty ? "Date pending" : draft.startsAt,
            daypart: draft.startsAt.lowercased().contains("sat") ? "Saturday morning" : "Weeknight",
            duration: draft.duration,
            skills: skills.isEmpty ? ["General help"] : skills,
            impact: "Impact pending review",
            capacity: draft.capacity,
            attending: 0,
            safetyNote: draft.safetyNote.isEmpty ? "Needs pilot safety review." : draft.safetyNote,
            reviewNote: needsEscalation ? "Sensitive terms detected. Review before listing." : "New organizer submission from \(draft.contactEmail). Affiliation: \(draft.communityAffiliation).",
            listingType: draft.listingType,
            rewardEligible: draft.listingType != .awareness && draft.listingType != .sponsored,
            handprintPoints: draft.listingType == .awareness || draft.listingType == .sponsored ? 0 : 80,
            actionBridge: draft.listingType == .awareness ? "Add a cleanup, signup table, service clinic, or other hands-on action to make this reward eligible." : nil
        )
        actions.insert(newAction, at: 0)
        selectedActionId = newAction.id
        activeTab = .enable
        persist()
        postOrganizerSubmission(draft, createdAction: newAction)
    }

    func toggleFollow(_ organizer: OrganizerImpactProfile) {
        guard let index = organizerProfiles.firstIndex(where: { $0.id == organizer.id }) else { return }
        let nextValue = !(organizerProfiles[index].savedByViewer ?? false)
        organizerProfiles[index].savedByViewer = nextValue
        persist()
        Task {
            do {
                try await apiClient.setOrganizationFollow(organizerId: organizer.id, saved: nextValue)
            } catch {
                await MainActor.run { syncStatus = "Follow saved locally" }
            }
        }
    }

    func saveShakeConnection(handle: String, name: String) {
        let normalizedHandle = handle.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !normalizedHandle.isEmpty, normalizedHandle != profile.handle else { return }

        if let index = followedWorldChangers.firstIndex(where: { $0.handle == normalizedHandle }) {
            followedWorldChangers[index].savedByViewer = true
            followedWorldChangers[index].name = name
        } else {
            followedWorldChangers.insert(
                FollowedWorldChanger(
                    handle: normalizedHandle,
                    name: name,
                    tier: "World Changer",
                    focus: "Connected in person through Shake",
                    recruiting: [],
                    following: [],
                    points: 0,
                    savedByViewer: true
                ),
                at: 0
            )
        }
        syncStatus = "Shake saved to your network"
        persist()
    }

    func toggleFollow(_ worldChanger: FollowedWorldChanger) {
        guard let index = followedWorldChangers.firstIndex(where: { $0.handle == worldChanger.handle }) else { return }
        followedWorldChangers[index].savedByViewer.toggle()
        let nextProfile = followedWorldChangers[index]
        persist()
        Task {
            do {
                try await apiClient.setWorldChangerFollow(worldChanger: nextProfile)
            } catch {
                await MainActor.run { syncStatus = "Shake connection saved locally" }
            }
        }
    }

    func resetLocalState() {
        profile = MockHandprintData.profile
        actions = MockHandprintData.actions
        marks = MockHandprintData.marks
        rsvps = ["tenant-rights-clinic": .checkedIn]
        reports = []
        organizerProfiles = MockHandprintData.organizerProfiles
        impactReceipts = MockHandprintData.impactReceipts
        followedWorldChangers = MockHandprintData.followedWorldChangers
        reachRewards = MockHandprintData.reachRewards
        trainingCredentials = MockHandprintData.trainingCredentials
        selectedActionId = MockHandprintData.actions.first?.id ?? ""
        activeTab = .reach
        isOnboarded = false
        authState = .appleReady
        locationPermission = .notRequested
        openedPublicHandle = nil
        loadedPublicProfile = nil
        lastReportConfirmation = nil
        persist()
    }

    func configureForUITesting(arguments: [String]) {
        guard arguments.contains(where: { $0.hasPrefix("-ui-testing-") }) else { return }

        if arguments.contains("-ui-testing-long-content") {
            profile.name = "Alexandria Montgomery-Washington the Community Connector"
            if !actions.isEmpty {
                actions[0].title = "Intergenerational neighborhood resilience, food access, and community resource distribution day"
                actions[0].summary = "Coordinate an unusually detailed, multi-part community action with volunteers, partner teams, and neighbors across the region."
                selectedActionId = actions[0].id
            }
        }

        if arguments.contains("-ui-testing-empty-account") {
            marks = []
            rsvps = [:]
            followedWorldChangers = []
            organizerProfiles = organizerProfiles.map { profile in
                var updated = profile
                updated.savedByViewer = false
                return updated
            }
        }

        if arguments.contains("-ui-testing-large-results"), !actions.isEmpty {
            let seedActions = actions
            actions = (0..<120).map { index in
                var action = seedActions[index % seedActions.count]
                action.id = "load-test-\(index)"
                action.title = "\(action.title) \(index + 1)"
                action.distanceMiles = Double((index % 100) + 1)
                return action
            }
            selectedActionId = actions[0].id
        }

        if arguments.contains("-ui-testing-skip-onboarding") {
            isOnboarded = true
            authState = .signedIn
        }

        if arguments.contains("-ui-testing-tab-wave") {
            activeTab = .wave
        }
    }

    @MainActor
    func refreshFromBackend() async {
        organizationLoadState = .loading
        receiptLoadState = .loading
        do {
            let payload = try await apiClient.fetchPilotData()
            profile = payload.profile
            actions = payload.actions
            marks = payload.marks
            rsvps = payload.rsvps
            reports = payload.reports
            selectedActionId = payload.selectedActionId
            isOnboarded = payload.isOnboarded
            authState = payload.authState
            locationPermission = payload.locationPermission
            syncStatus = backendConfiguration.usesMockData ? "Handprint is ready" : "Synced"
            persist()
        } catch {
            syncStatus = "Sync unavailable"
        }

        do {
            organizerProfiles = try await apiClient.fetchOrganizations()
            organizationLoadState = organizerProfiles.isEmpty ? .empty : .ready
        } catch {
            organizationLoadState = .error
            syncStatus = "World Enablers unavailable"
        }

        do {
            impactReceipts = try await apiClient.fetchImpactReceipts()
            receiptLoadState = impactReceipts.isEmpty ? .empty : .ready
        } catch {
            receiptLoadState = .error
            syncStatus = "Receipts unavailable"
        }

        do {
            followedWorldChangers = try await apiClient.fetchWorldChangers()
        } catch {
            syncStatus = "Shake using local people"
        }

        do {
            reachRewards = try await apiClient.fetchReachRewards()
            trainingCredentials = try await apiClient.fetchTrainingCredentials()
        } catch {
            syncStatus = "Saved rewards are ready"
        }

        persist()
    }

    private func update(_ action: LocalAction, status: EventStatus, trustTier: TrustTier, reviewNote: String) {
        guard let index = actions.firstIndex(where: { $0.id == action.id }) else { return }
        actions[index].status = status
        actions[index].trustTier = trustTier
        actions[index].reviewNote = reviewNote
    }

    private func upsertMark(for action: LocalAction, status: RsvpStatus) {
        let source: String
        let weight: Double
        let verb: String

        switch status {
        case .confirmed:
            source = "Organizer confirmed"
            weight = 5
            verb = "Completed"
        case .checkedIn:
            source = "Check-in"
            weight = 4
            verb = "Checked in"
        case .saved:
            source = "RSVP"
            weight = 1
            verb = "Saved"
        case .going:
            source = "RSVP"
            weight = 2
            verb = "RSVP"
        }

        let mark = HandprintMark(
            id: "mark-\(action.id)-\(status.rawValue)",
            eventId: action.id,
            category: action.category,
            label: "\(verb): \(action.title)",
            weight: weight,
            source: source
        )

        marks.removeAll { $0.id == mark.id }
        marks.append(mark)
    }

    private func persist() {
        let state = HandprintAppState(
            profile: profile,
            actions: actions,
            marks: marks,
            organizerProfiles: organizerProfiles,
            impactReceipts: impactReceipts,
            reachRewards: reachRewards,
            trainingCredentials: trainingCredentials,
            rsvps: rsvps,
            selectedActionId: selectedActionId,
            isOnboarded: isOnboarded,
            authState: authState,
            locationPermission: locationPermission,
            reports: reports,
            followedWorldChangers: followedWorldChangers
        )
        guard let data = try? JSONEncoder().encode(state) else { return }
        UserDefaults.standard.set(data, forKey: persistenceKey)
    }

    private func restore() {
        guard
            let data = UserDefaults.standard.data(forKey: persistenceKey),
            let state = try? JSONDecoder().decode(HandprintAppState.self, from: data)
        else {
            persist()
            return
        }
        profile = state.profile
        actions = state.actions
        marks = state.marks
        rsvps = state.rsvps
        reports = state.reports
        selectedActionId = state.selectedActionId
        isOnboarded = state.isOnboarded
        authState = state.authState
        locationPermission = state.locationPermission
        followedWorldChangers = state.followedWorldChangers ?? MockHandprintData.followedWorldChangers
        organizerProfiles = state.organizerProfiles ?? MockHandprintData.organizerProfiles
        impactReceipts = state.impactReceipts ?? MockHandprintData.impactReceipts
        reachRewards = state.reachRewards ?? MockHandprintData.reachRewards
        trainingCredentials = state.trainingCredentials ?? MockHandprintData.trainingCredentials
    }

    private func persistProfileChange() {
        persist()
        let nextProfile = profile
        Task {
            do {
                try await apiClient.updateProfileSettings(profile: nextProfile)
                await MainActor.run { syncStatus = "Profile settings synced" }
            } catch {
                await MainActor.run { syncStatus = "Profile settings saved locally" }
            }
        }
    }

    private func updateApproximateCommunity(from location: CLLocation) async {
        if let nearest = nearestKnownCommunity(to: location), nearest.distanceMiles <= 80 {
            profile.launchCommunity = nearest.community.label
            locationPermission = .approximateAllowed
            syncStatus = "Nearest city set to \(nearest.community.label)"
            persistProfileChange()
            return
        }

        do {
            let placemarks = try await geocoder.reverseGeocodeLocation(location)
            guard let placemark = placemarks.first else {
                if let nearest = nearestKnownCommunity(to: location) {
                    profile.launchCommunity = nearest.community.label
                    locationPermission = .approximateAllowed
                    syncStatus = "Nearest known city set to \(nearest.community.label)"
                    persistProfileChange()
                } else {
                    syncStatus = "Location found, but no nearby town was available."
                }
                return
            }
            let city = placemark.locality ?? placemark.subLocality ?? placemark.administrativeArea ?? profile.launchCommunity
            let state = placemark.administrativeArea
            let label = [city, state]
                .compactMap { $0 }
                .filter { !$0.isEmpty }
                .removingAdjacentDuplicates()
                .joined(separator: ", ")
            profile.launchCommunity = label.isEmpty ? profile.launchCommunity : label
            locationPermission = .approximateAllowed
            syncStatus = "Approximate area set to \(profile.launchCommunity)"
            persistProfileChange()
        } catch {
            syncStatus = "Location found, but reverse lookup failed."
            persist()
        }
    }

    private func nearestKnownCommunity(to location: CLLocation) -> (community: KnownCommunity, distanceMiles: Double)? {
        KnownCommunity.nearest(to: location)
    }

    private func loadPublicProfile(handle: String) {
        Task {
            do {
                let payload = try await apiClient.fetchPublicProfile(handle: handle)
                await MainActor.run {
                    loadedPublicProfile = payload
                    syncStatus = backendConfiguration.usesMockData ? "Handprint is ready" : "Public profile loaded"
                }
            } catch {
                await MainActor.run {
                    loadedPublicProfile = nil
                    syncStatus = "Public profile unavailable"
                }
            }
        }
    }

    private func postRSVP(_ status: RsvpStatus, for action: LocalAction) {
        Task {
            do {
                if status == .checkedIn {
                    try await apiClient.checkIn(actionId: action.id)
                } else {
                    try await apiClient.rsvp(actionId: action.id, status: status)
                }
            } catch {
                await MainActor.run { syncStatus = "Saved locally" }
            }
        }
    }

    private func postOrganizerSubmission(_ draft: OrganizerDraft, createdAction: LocalAction) {
        Task {
            do {
                try await apiClient.submitOrganizerDraft(draft, createdAction: createdAction)
            } catch {
                await MainActor.run { syncStatus = "Submission saved locally" }
            }
        }
    }

    private func postReviewDecision(_ decision: EventStatus, for action: LocalAction) {
        Task {
            do {
                try await apiClient.review(actionId: action.id, decision: decision)
            } catch {
                await MainActor.run { syncStatus = "Review saved locally" }
            }
        }
    }

    private func postReport(_ report: EventReport) {
        Task {
            do {
                try await apiClient.report(report)
            } catch {
                await MainActor.run { syncStatus = "Report saved locally" }
            }
        }
    }
}

struct HandprintAPIClient {
    let configuration: BackendConfiguration

    func fetchPilotData() async throws -> HandprintAppState {
        if configuration.usesMockData || configuration.baseURL == nil {
            return HandprintAppState(
                profile: MockHandprintData.profile,
                actions: MockHandprintData.actions,
                marks: MockHandprintData.marks,
                rsvps: ["tenant-rights-clinic": .checkedIn],
                selectedActionId: MockHandprintData.actions.first?.id ?? "",
                isOnboarded: false,
                authState: .appleReady,
                locationPermission: .notRequested,
                reports: [],
                followedWorldChangers: MockHandprintData.followedWorldChangers
            )
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/pilot")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(HandprintAppState.self, from: data)
    }

    func fetchPublicProfile(handle: String) async throws -> PublicHandprintPayload {
        if configuration.usesMockData || configuration.baseURL == nil {
            return PublicHandprintPayload(
                profile: PublicProfileSummary(
                    handle: MockHandprintData.profile.handle,
                    displayName: MockHandprintData.profile.name,
                    locationLabel: MockHandprintData.profile.launchCommunity,
                    statement: "A visible record of useful local action and what is next.",
                    sharePath: "/u/\(MockHandprintData.profile.handle)",
                    highlights: [
                        PublicHighlightSummary(label: "Visible marks", value: "\(MockHandprintData.marks.count)"),
                        PublicHighlightSummary(label: "Home area", value: MockHandprintData.profile.launchCommunity),
                        PublicHighlightSummary(label: "Join next", value: "3")
                    ]
                ),
                completed: MockHandprintData.marks.map { mark in
                    PublicCompletedAction(mark: mark, action: MockHandprintData.actions.first(where: { $0.id == mark.eventId }))
                },
                nextActions: Array(MockHandprintData.actions.filter { $0.status == .approved }.prefix(3))
            )
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/profile/\(handle)")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(PublicHandprintPayload.self, from: data)
    }

    func fetchOrganizations() async throws -> [OrganizerImpactProfile] {
        if configuration.usesMockData || configuration.baseURL == nil {
            return MockHandprintData.organizerProfiles
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/organizations")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(OrganizationProfilesResponse.self, from: data).profiles
    }

    func fetchImpactReceipts() async throws -> [ImpactReceipt] {
        if configuration.usesMockData || configuration.baseURL == nil {
            return MockHandprintData.impactReceipts
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/impact-receipts")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(ImpactReceiptsResponse.self, from: data).receipts
    }

    func fetchWorldChangers() async throws -> [FollowedWorldChanger] {
        if configuration.usesMockData || configuration.baseURL == nil {
            return MockHandprintData.followedWorldChangers
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/world-changers")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(WorldChangerProfilesResponse.self, from: data).profiles
    }

    func updateProfileSettings(profile: UserProfile) async throws {
        try await post(["profile": profile], path: "api/mobile/profile")
    }

    func fetchReachRewards() async throws -> [ReachReward] {
        if configuration.usesMockData || configuration.baseURL == nil {
            return MockHandprintData.reachRewards
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/rewards")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(ReachRewardsResponse.self, from: data).rewards
    }

    func fetchTrainingCredentials() async throws -> [TrainingCredential] {
        if configuration.usesMockData || configuration.baseURL == nil {
            return MockHandprintData.trainingCredentials
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/training-credentials")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(TrainingCredentialsResponse.self, from: data).credentials
    }

    func setOrganizationFollow(organizerId: String, saved: Bool) async throws {
        try await post(OrganizationFollowPayload(organizerId: organizerId, savedByViewer: saved), path: "api/organizers")
    }

    func setWorldChangerFollow(worldChanger: FollowedWorldChanger) async throws {
        try await post(WorldChangerFollowPayload(worldChanger: worldChanger), path: "api/mobile/world-changers")
    }

    func rsvp(actionId: String, status: RsvpStatus) async throws {
        try await post(["actionId": actionId, "status": status.rawValue], path: "api/mobile/rsvp")
    }

    func checkIn(actionId: String) async throws {
        try await post(["actionId": actionId], path: "api/mobile/checkin")
    }

    func submitOrganizerDraft(_ draft: OrganizerDraft, createdAction: LocalAction) async throws {
        let payload = OrganizerSubmissionPayload(draft: draft, createdAction: createdAction)
        try await post(payload, path: "api/mobile/organizer-submit")
    }

    func review(actionId: String, decision: EventStatus) async throws {
        try await post(["actionId": actionId, "decision": decision.rawValue], path: "api/mobile/review")
    }

    func report(_ report: EventReport) async throws {
        try await post(report, path: "api/mobile/report")
    }

    func reviewSocialText(_ text: String, surface: String) async throws -> AffirmationReview {
        try await postForResponse(
            ["action": "moderation_review", "surface": surface, "text": text],
            path: "api/mobile/social",
            responseType: SocialReviewResponse.self
        ).review ?? AffirmationReview(status: .ready, issues: [], suggestion: text)
    }

    func saveShareDraft(platformId: String, message: String) async throws {
        try await post(
            ["action": "save_share_draft", "platformId": platformId, "message": message],
            path: "api/mobile/social"
        )
    }

    func postSocialComment(targetType: String, targetId: String, text: String) async throws {
        try await post(
            ["action": "create_comment", "targetType": targetType, "targetId": targetId, "text": text],
            path: "api/mobile/social"
        )
    }

    private func post<T: Encodable>(_ payload: T, path: String) async throws {
        guard !configuration.usesMockData, let baseURL = configuration.baseURL else { return }

        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(payload)
        let (_, response) = try await URLSession.shared.data(for: request)

        if let httpResponse = response as? HTTPURLResponse, !(200...299).contains(httpResponse.statusCode) {
            throw URLError(.badServerResponse)
        }
    }

    private func postForResponse<T: Encodable, R: Decodable>(_ payload: T, path: String, responseType: R.Type) async throws -> R {
        guard !configuration.usesMockData, let baseURL = configuration.baseURL else {
            throw URLError(.unsupportedURL)
        }

        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(payload)
        let (data, response) = try await URLSession.shared.data(for: request)

        if let httpResponse = response as? HTTPURLResponse, !(200...299).contains(httpResponse.statusCode) {
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode(responseType, from: data)
    }
}

private struct OrganizerSubmissionPayload: Encodable {
    var title: String
    var organizer: String
    var organizerWebsite: String
    var communityAffiliation: String
    var contactEmail: String
    var neighborhood: String
    var locationName: String
    var startsAt: String
    var duration: String
    var capacity: Int
    var category: String
    var listingType: String
    var summary: String
    var skills: [String]
    var safetyNote: String
    var actionId: String

    init(draft: OrganizerDraft, createdAction: LocalAction) {
        title = draft.title
        organizer = draft.organizer
        organizerWebsite = draft.organizerWebsite
        communityAffiliation = draft.communityAffiliation
        contactEmail = draft.contactEmail
        neighborhood = draft.neighborhood
        locationName = draft.locationName
        startsAt = draft.startsAt
        duration = draft.duration
        capacity = draft.capacity
        category = draft.category.rawValue
        listingType = draft.listingType.rawValue
        summary = draft.summary
        skills = createdAction.skills
        safetyNote = draft.safetyNote
        actionId = createdAction.id
    }
}

private struct OrganizationProfilesResponse: Decodable {
    var profiles: [OrganizerImpactProfile]
}

private struct ImpactReceiptsResponse: Decodable {
    var receipts: [ImpactReceipt]
}

private struct WorldChangerProfilesResponse: Decodable {
    var profiles: [FollowedWorldChanger]
}

private struct ReachRewardsResponse: Decodable {
    var rewards: [ReachReward]
}

private struct TrainingCredentialsResponse: Decodable {
    var credentials: [TrainingCredential]
}

private extension Array where Element: Equatable {
    func removingAdjacentDuplicates() -> [Element] {
        reduce(into: []) { result, element in
            if result.last != element {
                result.append(element)
            }
        }
    }
}

private struct OrganizationFollowPayload: Encodable {
    var followUpdate: FollowUpdate

    init(organizerId: String, savedByViewer: Bool) {
        followUpdate = FollowUpdate(organizerId: organizerId, savedByViewer: savedByViewer)
    }

    struct FollowUpdate: Encodable {
        var organizerId: String
        var savedByViewer: Bool
    }
}

private struct WorldChangerFollowPayload: Encodable {
    var handle: String
    var savedByViewer: Bool
    var profile: FollowedWorldChanger

    init(worldChanger: FollowedWorldChanger) {
        handle = worldChanger.handle
        savedByViewer = worldChanger.savedByViewer
        profile = worldChanger
    }
}

extension BackendConfiguration {
    static func fromBundle() -> BackendConfiguration {
        guard
            let rawValue = Bundle.main.object(forInfoDictionaryKey: "HANDPRINT_API_BASE_URL") as? String,
            !rawValue.isEmpty,
            let url = URL(string: rawValue)
        else {
            return .localMock
        }

        return BackendConfiguration(baseURL: url, usesMockData: false)
    }
}
