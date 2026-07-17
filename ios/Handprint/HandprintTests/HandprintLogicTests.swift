import XCTest
import CoreLocation
@testable import Handprint

@MainActor
final class HandprintLogicTests: XCTestCase {
    func testRecommendationExplainsUsefulMatch() throws {
        let store = HandprintStore()
        store.resetLocalState()

        let action = try XCTUnwrap(MockHandprintData.actions.first { $0.id == "food-shelf-saturday" })
        let recommendation = store.score(action: action)

        XCTAssertGreaterThan(recommendation.score, 50)
        XCTAssertTrue(recommendation.reasons.contains("Very near you"))
        XCTAssertTrue(recommendation.reasons.contains("Anchor World Enabler"))
    }

    func testOnboardingPersistsProfileAndSignsIn() {
        let store = HandprintStore()
        store.resetLocalState()

        var profile = MockHandprintData.profile
        profile.handle = "pilot-dan"

        store.completeOnboarding(profile: profile)

        XCTAssertTrue(store.isOnboarded)
        XCTAssertEqual(store.authState, .signedIn)
        XCTAssertEqual(store.profile.handle, "pilot-dan")
    }

    func testOrganizerSubmissionRoutesToReviewQueue() {
        let store = HandprintStore()
        store.resetLocalState()

        let beforeCount = store.actions.count
        let draft = OrganizerDraft(
            title: "Tool library intake",
            organizer: "Northside Tool Library",
            organizerWebsite: "https://example.org",
            communityAffiliation: "Northside nonprofit network",
            contactEmail: "ops@example.org",
            neighborhood: "Northside",
            locationName: "Tool Library",
            startsAt: "Sat 1:00 PM",
            duration: "2 hours",
            capacity: 12,
            category: .mutualAid,
            summary: "Help neighbors borrow and return shared household tools.",
            skills: "Welcoming, Logistics",
            safetyNote: "Indoor desk shift.",
            termsAccepted: true
        )

        store.submit(draft)

        XCTAssertEqual(store.actions.count, beforeCount + 1)
        XCTAssertEqual(store.actions.first?.status, .pending)
        XCTAssertEqual(store.activeTab, .enable)
    }

    func testSensitiveOrganizerSubmissionEscalates() {
        let store = HandprintStore()
        store.resetLocalState()

        let draft = OrganizerDraft(
            title: "Youth tutoring intake",
            organizer: "Tutoring Circle",
            organizerWebsite: "https://example.org",
            communityAffiliation: "Library partner",
            contactEmail: "ops@example.org",
            neighborhood: "Northside",
            locationName: "Library",
            startsAt: "Wed 5:00 PM",
            duration: "2 hours",
            capacity: 10,
            category: .mentoring,
            summary: "Youth and school tutoring support.",
            skills: "Mentoring",
            safetyNote: "Background checks required.",
            termsAccepted: true
        )

        store.submit(draft)

        XCTAssertEqual(store.actions.first?.status, .escalated)
        XCTAssertEqual(store.actions.first?.trustTier, .escalated)
    }

    func testDeepLinkRoutesToPublicProfile() {
        let store = HandprintStore()
        store.resetLocalState()
        store.isOnboarded = true

        store.handleDeepLink(URL(string: "handprint://u/dan")!)

        XCTAssertEqual(store.openedPublicHandle, "dan")
        XCTAssertEqual(store.activeTab, .wave)
    }

    func testShakeDeepLinkOpensNearbyConnection() {
        let store = HandprintStore()
        store.resetLocalState()

        store.handleDeepLink(URL(string: "handprint://shake")!)

        XCTAssertEqual(store.activeTab, .shake)
    }

    func testReportEscalatesActionAndCreatesOpenReport() {
        let store = HandprintStore()
        store.resetLocalState()

        let action = MockHandprintData.actions[0]
        store.report(action, reason: .unsafe, note: "Door instructions are unclear.")

        XCTAssertEqual(store.openReports.count, 1)
        XCTAssertEqual(store.actions.first(where: { $0.id == action.id })?.status, .escalated)
        XCTAssertEqual(store.activeTab, .reach)
    }

    func testNearestCommunityFindsMartinsburg() {
        let location = CLLocation(latitude: 39.4565, longitude: -77.9642)
        let nearest = KnownCommunity.nearest(to: location)

        XCTAssertEqual(nearest?.community.label, "Martinsburg, WV")
        XCTAssertLessThan(nearest?.distanceMiles ?? 999, 1)
    }

    func testNearestCommunityFindsCupertinoForAppleSimulatorArea() {
        let location = CLLocation(latitude: 37.3349, longitude: -122.0090)
        let nearest = KnownCommunity.nearest(to: location)

        XCTAssertEqual(nearest?.community.label, "Cupertino, CA")
        XCTAssertLessThan(nearest?.distanceMiles ?? 999, 5)
    }

    func testCommunitySuggestionsUseSharedCatalog() {
        let suggestions = KnownCommunity.suggestions(matching: "mart")

        XCTAssertEqual(suggestions.first?.label, "Martinsburg, WV")
    }
}
