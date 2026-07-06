import Foundation

enum EngagementLevel: String, CaseIterable, Identifiable, Codable, Hashable {
    case observer = "Observer"
    case participant = "Participant"
    case helper = "Helper"
    case organizer = "Organizer"

    var id: String { rawValue }
}

enum EventCategory: String, CaseIterable, Identifiable, Codable, Hashable {
    case foodSupport = "Food support"
    case cleanup = "Cleanup"
    case mentoring = "Mentoring"
    case mutualAid = "Mutual aid"
    case civicForum = "Civic forum"
    case artsCommunity = "Arts community"
    case preparedness = "Preparedness"

    var id: String { rawValue }
}

enum TrustTier: String, Codable, Hashable {
    case anchorPartner = "Anchor partner"
    case verified = "Verified"
    case pendingReview = "Pending review"
    case escalated = "Escalated"
}

enum EventStatus: String, Codable, Hashable {
    case approved
    case pending
    case escalated
    case rejected
}

enum RsvpStatus: String, Codable, Hashable {
    case saved
    case going
    case checkedIn
    case confirmed

    var label: String {
        switch self {
        case .saved: "Saved"
        case .going: "Going"
        case .checkedIn: "Checked in"
        case .confirmed: "Confirmed"
        }
    }
}

struct UserProfile: Codable, Equatable, Hashable {
    var name: String
    var handle: String
    var launchCommunity: String
    var radiusMiles: Double
    var interests: Set<EventCategory>
    var skills: Set<String>
    var availability: Set<String>
    var engagementLevel: EngagementLevel
}

enum AppTab: String, Codable, Hashable {
    case discover
    case handprint
    case share
    case organize
    case review
}

enum AuthState: String, Codable, Hashable {
    case signedOut
    case appleReady
    case signedIn
}

enum LocationPermissionState: String, Codable, Hashable {
    case notRequested
    case approximateAllowed
    case denied
}

struct LocalAction: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var title: String
    var summary: String
    var category: EventCategory
    var organizer: String
    var trustTier: TrustTier
    var status: EventStatus
    var neighborhood: String
    var distanceMiles: Double
    var startsAt: String
    var daypart: String
    var duration: String
    var skills: [String]
    var impact: String
    var capacity: Int
    var attending: Int
    var safetyNote: String
    var reviewNote: String
}

struct Recommendation: Identifiable {
    var id: String { action.id }
    var action: LocalAction
    var score: Int
    var reasons: [String]
}

struct HandprintMark: Identifiable, Codable, Equatable {
    var id: String
    var eventId: String
    var category: EventCategory
    var label: String
    var weight: Double
    var source: String
}

struct OrganizerDraft {
    var title = ""
    var organizer = ""
    var organizerWebsite = ""
    var communityAffiliation = ""
    var contactEmail = ""
    var neighborhood = ""
    var locationName = ""
    var startsAt = ""
    var duration = "2 hours"
    var capacity = 20
    var category: EventCategory = .foodSupport
    var summary = ""
    var skills = ""
    var safetyNote = ""
    var termsAccepted = false

    var isSubmittable: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            !organizer.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            !communityAffiliation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            !contactEmail.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            !summary.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            termsAccepted
    }
}

enum EventReportReason: String, CaseIterable, Identifiable, Codable, Hashable {
    case misleading = "Misleading details"
    case unsafe = "Unsafe or harmful"
    case harassment = "Harassment or intimidation"
    case campaign = "Campaign or election activity"
    case youthSafety = "Youth safety concern"
    case other = "Other"

    var id: String { rawValue }
}

struct EventReport: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var eventId: String
    var reason: EventReportReason
    var note: String
    var createdAt: Date
    var status: String
}

struct HandprintAppState: Codable {
    var profile: UserProfile
    var actions: [LocalAction]
    var marks: [HandprintMark]
    var rsvps: [String: RsvpStatus]
    var selectedActionId: String
    var isOnboarded: Bool
    var authState: AuthState
    var locationPermission: LocationPermissionState
    var reports: [EventReport]
}

struct BackendConfiguration: Codable, Equatable {
    var baseURL: URL?
    var usesMockData: Bool

    static let localMock = BackendConfiguration(baseURL: nil, usesMockData: true)
}
