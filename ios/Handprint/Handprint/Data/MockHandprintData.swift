import Foundation

enum MockHandprintData {
    static let profile = UserProfile(
        name: "Dan",
        handle: "dan",
        launchCommunity: "Northside pilot",
        radiusMiles: 5,
        interests: [.foodSupport, .mutualAid, .civicForum, .artsCommunity],
        skills: ["Writing", "Logistics", "Mentoring"],
        availability: ["Weeknight", "Saturday morning"],
        engagementLevel: .helper
    )

    static let actions: [LocalAction] = [
        LocalAction(
            id: "food-shelf-saturday",
            title: "Saturday food shelf sort",
            summary: "Pack pantry boxes for families before the Monday distribution window.",
            category: .foodSupport,
            organizer: "Northside Community Pantry",
            trustTier: .anchorPartner,
            status: .approved,
            neighborhood: "Northside",
            distanceMiles: 1.2,
            startsAt: "Sat 9:30 AM",
            daypart: "Saturday morning",
            duration: "2 hours",
            skills: ["Logistics", "Lifting", "Welcoming"],
            impact: "80 pantry boxes prepared",
            capacity: 24,
            attending: 17,
            safetyNote: "Indoor shift, closed-toe shoes recommended.",
            reviewNote: "Anchor organizer with recurring pantry operations."
        ),
        LocalAction(
            id: "tenant-rights-clinic",
            title: "Tenant clinic intake desk",
            summary: "Help neighbors complete intake forms before meeting volunteer advisors.",
            category: .mutualAid,
            organizer: "Civic Help Desk",
            trustTier: .verified,
            status: .approved,
            neighborhood: "Central Library",
            distanceMiles: 0.8,
            startsAt: "Thu 6:00 PM",
            daypart: "Weeknight",
            duration: "2.5 hours",
            skills: ["Writing", "Welcoming", "Spanish helpful"],
            impact: "30 intake sessions supported",
            capacity: 12,
            attending: 8,
            safetyNote: "Public library location with staff present.",
            reviewNote: "Confirmed as intake only, not legal advice."
        ),
        LocalAction(
            id: "budget-forum",
            title: "Neighborhood budget forum",
            summary: "Join a moderated forum on parks, transit, and library funding priorities.",
            category: .civicForum,
            organizer: "District Civic Table",
            trustTier: .verified,
            status: .approved,
            neighborhood: "Town Hall Annex",
            distanceMiles: 1.7,
            startsAt: "Tue 7:00 PM",
            daypart: "Weeknight",
            duration: "90 minutes",
            skills: ["Listening", "Questions"],
            impact: "Public priorities captured",
            capacity: 90,
            attending: 41,
            safetyNote: "Moderated forum. No campaign activity allowed in pilot.",
            reviewNote: "Civic forum, non-candidate and non-campaign."
        ),
        LocalAction(
            id: "river-cleanup",
            title: "Riverwalk cleanup sprint",
            summary: "A fast volunteer cleanup before the Sunday family market opens.",
            category: .cleanup,
            organizer: "Friends of the Riverwalk",
            trustTier: .verified,
            status: .approved,
            neighborhood: "Old Mill",
            distanceMiles: 2.4,
            startsAt: "Sun 8:00 AM",
            daypart: "Weekend morning",
            duration: "90 minutes",
            skills: ["Outdoor work", "Team lead"],
            impact: "3 blocks cleared",
            capacity: 40,
            attending: 22,
            safetyNote: "Gloves supplied. Work stays on public paths.",
            reviewNote: "Verified nonprofit partner."
        ),
        LocalAction(
            id: "mural-day",
            title: "Community mural prep day",
            summary: "Prime panels, lay out supplies, and help neighbors prepare a shared mural wall.",
            category: .artsCommunity,
            organizer: "Block Studio Cooperative",
            trustTier: .verified,
            status: .approved,
            neighborhood: "Market Street",
            distanceMiles: 2.0,
            startsAt: "Sat 11:00 AM",
            daypart: "Saturday morning",
            duration: "3 hours",
            skills: ["Setup", "Creative support"],
            impact: "One public wall prepared",
            capacity: 30,
            attending: 19,
            safetyNote: "Outdoor prep. Paint handling instructions provided.",
            reviewNote: "Verified community arts partner."
        ),
        LocalAction(
            id: "youth-story-lab",
            title: "Youth story lab mentors",
            summary: "Coach high school students as they shape short stories for a community showcase.",
            category: .mentoring,
            organizer: "City Arts Youth Lab",
            trustTier: .pendingReview,
            status: .escalated,
            neighborhood: "East Arts",
            distanceMiles: 3.1,
            startsAt: "Wed 5:30 PM",
            daypart: "Weeknight",
            duration: "2 hours",
            skills: ["Writing", "Mentoring"],
            impact: "18 students coached",
            capacity: 10,
            attending: 5,
            safetyNote: "Youth-facing event needs background-check policy review.",
            reviewNote: "Escalated because minors are involved."
        )
    ]

    static let marks: [HandprintMark] = [
        HandprintMark(
            id: "mark-tenant-confirmed",
            eventId: "tenant-rights-clinic",
            category: .mutualAid,
            label: "Helped intake desk",
            weight: 4,
            source: "Organizer confirmed"
        ),
        HandprintMark(
            id: "mark-budget-checkin",
            eventId: "budget-forum",
            category: .civicForum,
            label: "Joined budget forum",
            weight: 3,
            source: "Check-in"
        ),
        HandprintMark(
            id: "mark-food-confirmed",
            eventId: "food-shelf-saturday",
            category: .foodSupport,
            label: "Packed pantry boxes",
            weight: 5,
            source: "Organizer confirmed"
        )
    ]
}
