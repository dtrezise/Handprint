import CoreLocation
import Foundation

final class HandprintStore: ObservableObject {
    @Published var profile = MockHandprintData.profile
    @Published var actions = MockHandprintData.actions
    @Published var marks = MockHandprintData.marks
    @Published var rsvps: [String: RsvpStatus] = ["tenant-rights-clinic": .checkedIn]
    @Published var reports: [EventReport] = []
    @Published var selectedActionId = MockHandprintData.actions.first?.id ?? ""
    @Published var activeTab: AppTab = .discover
    @Published var isOnboarded = false
    @Published var authState: AuthState = .appleReady
    @Published var locationPermission: LocationPermissionState = .notRequested
    @Published var openedPublicHandle: String?
    @Published private(set) var backendConfiguration = BackendConfiguration.localMock
    @Published private(set) var syncStatus = "Using local pilot data"

    private let persistenceKey = "handprint.ios.localState.v1"
    private let apiClient: HandprintAPIClient
    private let locationManager = CLLocationManager()

    init() {
        let configuration = BackendConfiguration.fromBundle()
        backendConfiguration = configuration
        apiClient = HandprintAPIClient(configuration: configuration)
        syncStatus = configuration.usesMockData ? "Using local pilot data" : "Ready to sync"
        restore()
    }

    var shareURL: URL {
        URL(string: "https://handprint.local/u/\(profile.handle)")!
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

    var openReports: [EventReport] {
        reports.filter { $0.status == "open" }
    }

    func completeOnboarding(profile updatedProfile: UserProfile) {
        profile = updatedProfile
        isOnboarded = true
        authState = .signedIn
        persist()
    }

    func requestApproximateLocation() {
        locationManager.desiredAccuracy = kCLLocationAccuracyThreeKilometers
        locationManager.requestWhenInUseAuthorization()
        locationPermission = .approximateAllowed
        persist()
    }

    func continueWithoutLocation() {
        locationPermission = .denied
        persist()
    }

    func handleDeepLink(_ url: URL) {
        let components = url.pathComponents.filter { $0 != "/" }
        if url.scheme == "handprint", url.host == "u", let handle = components.first {
            openedPublicHandle = handle
            activeTab = handle == profile.handle ? .share : .handprint
            return
        }

        if components.first == "u", let handle = components.dropFirst().first {
            openedPublicHandle = handle
            activeTab = handle == profile.handle ? .share : .handprint
        }
    }

    func score(action: LocalAction) -> Recommendation {
        var score = 0.0
        var reasons: [String] = []

        if action.distanceMiles <= profile.radiusMiles {
            score += max(0, 24 - action.distanceMiles * 3)
            reasons.append(action.distanceMiles <= 1.5 ? "Very near you" : "Within your radius")
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
            reasons.append("Anchor organizer")
        case .verified:
            score += 12
            reasons.append("Verified organizer")
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
    }

    func approve(_ action: LocalAction) {
        update(action, status: .approved, trustTier: .verified, reviewNote: "Approved for pilot listing.")
        persist()
    }

    func escalate(_ action: LocalAction) {
        update(action, status: .escalated, trustTier: .escalated, reviewNote: "Requires additional review before public listing.")
        persist()
    }

    func reject(_ action: LocalAction) {
        update(action, status: .rejected, trustTier: .escalated, reviewNote: "Rejected from pilot listing. Organizer can revise and resubmit.")
        persist()
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
        activeTab = .review
        persist()
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
            reviewNote: needsEscalation ? "Sensitive terms detected. Review before listing." : "New organizer submission from \(draft.contactEmail). Affiliation: \(draft.communityAffiliation)."
        )
        actions.insert(newAction, at: 0)
        selectedActionId = newAction.id
        activeTab = .review
        persist()
    }

    func resetLocalState() {
        profile = MockHandprintData.profile
        actions = MockHandprintData.actions
        marks = MockHandprintData.marks
        rsvps = ["tenant-rights-clinic": .checkedIn]
        reports = []
        selectedActionId = MockHandprintData.actions.first?.id ?? ""
        activeTab = .discover
        isOnboarded = false
        authState = .appleReady
        locationPermission = .notRequested
        openedPublicHandle = nil
        persist()
    }

    @MainActor
    func refreshFromBackend() async {
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
            syncStatus = backendConfiguration.usesMockData ? "Using local pilot data" : "Synced"
            persist()
        } catch {
            syncStatus = "Sync unavailable"
        }
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
            rsvps: rsvps,
            selectedActionId: selectedActionId,
            isOnboarded: isOnboarded,
            authState: authState,
            locationPermission: locationPermission,
            reports: reports
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
                reports: []
            )
        }

        let baseURL = configuration.baseURL!
        let url = baseURL.appending(path: "api/mobile/pilot")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(HandprintAppState.self, from: data)
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
