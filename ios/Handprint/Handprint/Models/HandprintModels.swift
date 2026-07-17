import CoreLocation
import Foundation

enum EngagementLevel: String, CaseIterable, Identifiable, Codable, Hashable {
    case observer = "Observer"
    case participant = "Participant"
    case helper = "Helper"
    case organizer = "World Enabler"

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
    case communityService = "Community service"

    var id: String { rawValue }
}

enum EventListingType: String, CaseIterable, Identifiable, Codable, Hashable {
    case action
    case awareness
    case sponsored
    case training
    case fundraiser

    var id: String { rawValue }

    var label: String {
        switch self {
        case .action: "Hands-on"
        case .awareness: "Awareness"
        case .sponsored: "Sponsored"
        case .training: "Training"
        case .fundraiser: "Fundraiser"
        }
    }
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
    var rewardsEnabled: Bool? = true
}

enum AppTab: String, Codable, Hashable {
    case reach = "discover"
    case print = "handprint"
    case wave
    case shake = "handshake"
    case enable = "organize"
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

struct KnownCommunity: Identifiable, Codable, Equatable, Hashable {
    var id: String { label }
    let label: String
    let latitude: Double
    let longitude: Double

    var location: CLLocation {
        CLLocation(latitude: latitude, longitude: longitude)
    }

    static func nearest(to location: CLLocation) -> (community: KnownCommunity, distanceMiles: Double)? {
        catalog
            .map { community in
                (community, location.distance(from: community.location) / 1609.344)
            }
            .min { lhs, rhs in lhs.1 < rhs.1 }
    }

    static func suggestions(matching query: String, limit: Int = 6) -> [KnownCommunity] {
        let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !normalized.isEmpty else { return [] }
        return catalog
            .filter { $0.label.lowercased().contains(normalized) }
            .prefix(limit)
            .map { $0 }
    }

    static let catalog: [KnownCommunity] = [
        KnownCommunity(label: "Martinsburg, WV", latitude: 39.4562, longitude: -77.9639),
        KnownCommunity(label: "Hagerstown, MD", latitude: 39.6418, longitude: -77.7200),
        KnownCommunity(label: "Winchester, VA", latitude: 39.1857, longitude: -78.1633),
        KnownCommunity(label: "Frederick, MD", latitude: 39.4143, longitude: -77.4105),
        KnownCommunity(label: "Charles Town, WV", latitude: 39.2889, longitude: -77.8597),
        KnownCommunity(label: "Shepherdstown, WV", latitude: 39.4301, longitude: -77.8042),
        KnownCommunity(label: "Washington, DC", latitude: 38.9072, longitude: -77.0369),
        KnownCommunity(label: "Baltimore, MD", latitude: 39.2904, longitude: -76.6122),
        KnownCommunity(label: "Pittsburgh, PA", latitude: 40.4406, longitude: -79.9959),
        KnownCommunity(label: "Philadelphia, PA", latitude: 39.9526, longitude: -75.1652),
        KnownCommunity(label: "New York, NY", latitude: 40.7128, longitude: -74.0060),
        KnownCommunity(label: "Boston, MA", latitude: 42.3601, longitude: -71.0589),
        KnownCommunity(label: "Richmond, VA", latitude: 37.5407, longitude: -77.4360),
        KnownCommunity(label: "Raleigh, NC", latitude: 35.7796, longitude: -78.6382),
        KnownCommunity(label: "Atlanta, GA", latitude: 33.7490, longitude: -84.3880),
        KnownCommunity(label: "Chicago, IL", latitude: 41.8781, longitude: -87.6298),
        KnownCommunity(label: "Nashville, TN", latitude: 36.1627, longitude: -86.7816),
        KnownCommunity(label: "Austin, TX", latitude: 30.2672, longitude: -97.7431),
        KnownCommunity(label: "Denver, CO", latitude: 39.7392, longitude: -104.9903),
        KnownCommunity(label: "Phoenix, AZ", latitude: 33.4484, longitude: -112.0740),
        KnownCommunity(label: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437),
        KnownCommunity(label: "Cupertino, CA", latitude: 37.3229, longitude: -122.0322),
        KnownCommunity(label: "San Francisco, CA", latitude: 37.7749, longitude: -122.4194),
        KnownCommunity(label: "Portland, OR", latitude: 45.5152, longitude: -122.6784),
        KnownCommunity(label: "Seattle, WA", latitude: 47.6062, longitude: -122.3321)
    ]
}

enum RemoteCollectionState: String, Codable, Hashable {
    case loading
    case ready
    case empty
    case error
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
    var listingType: EventListingType? = nil
    var rewardEligible: Bool? = nil
    var handprintPoints: Int? = nil
    var actionBridge: String? = nil

    var listingTypeValue: EventListingType { listingType ?? .action }
    var isRewardEligible: Bool {
        rewardEligible ?? (status == .approved && listingTypeValue != .awareness && listingTypeValue != .sponsored)
    }
    var pointsValue: Int { handprintPoints ?? (isRewardEligible ? 80 : 0) }
    var rewardLabel: String {
        if isRewardEligible { return "Earns rewards" }
        return listingTypeValue == .sponsored ? "Sponsored" : "Awareness only"
    }
}

struct OrganizerImpactHighlight: Identifiable, Codable, Equatable, Hashable {
    var id: String { label }
    var label: String
    var value: String
}

struct OrganizerAccolade: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var title: String
    var category: String
    var description: String
    var issuedAt: String
    var evidence: String
    var status: String
}

struct OrganizerImpactProfile: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var handle: String
    var name: String
    var type: String
    var trustTier: TrustTier
    var publicSummary: String
    var savedByViewer: Bool?
    var eventsHosted: Int
    var attendeesMobilized: Int
    var confirmedParticipants: Int
    var volunteerHours: Int
    var handprintPointsIssued: Int
    var sponsorSlotsUsed: Int
    var sponsorSlotsLimit: Int
    var featuredEventIds: [String]
    var impactHighlights: [OrganizerImpactHighlight]
    var impactReceiptIds: [String]
    var grantReadySummary: String
    var accolades: [OrganizerAccolade]
}

struct ImpactReceipt: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var organizerId: String
    var eventId: String
    var title: String
    var beneficiary: String
    var accomplishment: String
    var confirmedBy: String
    var issuedAt: String
    var evidence: String
}

struct FollowedWorldChanger: Identifiable, Codable, Equatable, Hashable {
    var id: String { handle }
    var handle: String
    var name: String
    var tier: String
    var focus: String
    var recruiting: [String]
    var following: [String]
    var points: Int
    var savedByViewer: Bool
}

struct ReachReward: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var title: String
    var tier: String
    var category: String
    var description: String
    var requirement: String
    var status: String
}

struct TrainingCredential: Identifiable, Codable, Equatable, Hashable {
    var id: String
    var title: String
    var provider: String
    var confidence: String
    var status: String
    var leadershipUnlock: String
    var uploadState: String
    var evidenceLabel: String
}

struct Recommendation: Identifiable {
    var id: String { action.id }
    var action: LocalAction
    var score: Int
    var reasons: [String]
}

struct HandprintMark: Identifiable, Codable, Equatable, Hashable {
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
    var listingType: EventListingType = .action
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

struct ReportConfirmation: Codable, Equatable, Hashable {
    var reportId: String
    var actionTitle: String
    var message: String
}

struct PublicHighlightSummary: Identifiable, Codable, Equatable, Hashable {
    var id: String { label }
    var label: String
    var value: String
}

struct PublicProfileSummary: Codable, Equatable, Hashable {
    var handle: String
    var displayName: String
    var locationLabel: String
    var statement: String
    var sharePath: String
    var highlights: [PublicHighlightSummary]
}

struct PublicCompletedAction: Identifiable, Codable, Equatable, Hashable {
    var id: String { mark.id }
    var mark: HandprintMark
    var action: LocalAction?
}

struct PublicHandprintPayload: Codable, Equatable, Hashable {
    var profile: PublicProfileSummary
    var completed: [PublicCompletedAction]
    var nextActions: [LocalAction]
}

enum SharePlatform: String, CaseIterable, Identifiable, Codable, Hashable {
    case facebook = "Facebook"
    case instagramStory = "Instagram Story"
    case instagramReel = "Instagram Reel"
    case linkedIn = "LinkedIn"
    case tikTok = "TikTok Reel"
    case messages = "Messages"

    var id: String { rawValue }

    var aspectRatio: String {
        switch self {
        case .facebook: "4:5"
        case .instagramStory, .instagramReel, .tikTok: "9:16"
        case .linkedIn: "1.91:1"
        case .messages: "1:1"
        }
    }

    var characterLimit: Int {
        switch self {
        case .facebook: 63206
        case .linkedIn: 3000
        case .messages: 500
        default: 2200
        }
    }

    var hashtags: [String] {
        switch self {
        case .linkedIn: ["#Handprint", "#ServiceLeadership", "#CommunityImpact"]
        case .messages: ["#Handprint"]
        default: ["#Handprint", "#WorldChanger", "#DoSomething"]
        }
    }
}

enum AffirmationStatus: String, Codable, Hashable {
    case ready
    case rewrite
    case escalated
}

struct AffirmationReview: Codable, Equatable, Hashable {
    var status: AffirmationStatus
    var issues: [String]
    var suggestion: String
}

struct SocialReviewResponse: Codable, Equatable, Hashable {
    var review: AffirmationReview?
}

struct SocialLedgerSummary: Codable, Equatable, Hashable {
    var drafts: [String]
    var history: [String]
    var comments: [String]
    var messages: [String]
    var reports: [String]
}

struct HandprintAppState: Codable {
    var profile: UserProfile
    var actions: [LocalAction]
    var marks: [HandprintMark]
    var organizerProfiles: [OrganizerImpactProfile]? = nil
    var impactReceipts: [ImpactReceipt]? = nil
    var reachRewards: [ReachReward]? = nil
    var trainingCredentials: [TrainingCredential]? = nil
    var rsvps: [String: RsvpStatus]
    var selectedActionId: String
    var isOnboarded: Bool
    var authState: AuthState
    var locationPermission: LocationPermissionState
    var reports: [EventReport]
    var followedWorldChangers: [FollowedWorldChanger]? = nil
}

struct BackendConfiguration: Codable, Equatable {
    var baseURL: URL?
    var usesMockData: Bool

    static let localMock = BackendConfiguration(baseURL: nil, usesMockData: true)
}
