import Foundation

enum MockHandprintData {
    static let profile = UserProfile(
        name: "Dan",
        handle: "dan",
        launchCommunity: "Martinsburg, WV",
        radiusMiles: 50,
        interests: [.foodSupport, .mutualAid, .civicForum, .artsCommunity],
        skills: ["Writing", "Logistics", "Mentoring"],
        availability: ["Weeknight", "Saturday morning"],
        engagementLevel: .helper
    )

    static let actions: [LocalAction] = [
        LocalAction(
            id: "martinsburg-meals-on-wheels-delivery",
            title: "Meals on Wheels delivery route",
            summary: "Deliver hot meals and friendly wellness checks to homebound Berkeley County neighbors.",
            category: .foodSupport,
            organizer: "Berkeley County Meals on Wheels",
            trustTier: .pendingReview,
            status: .approved,
            neighborhood: "Martinsburg",
            distanceMiles: 0.4,
            startsAt: "Weekday lunch routes",
            daypart: "Weekday",
            duration: "1.5 hours",
            skills: ["Driving", "Welcoming", "Reliability"],
            impact: "Hot meals and wellness checks for homebound residents",
            capacity: 30,
            attending: 18,
            safetyNote: "Unofficial Handprint example. Driving roles may require organizer onboarding.",
            reviewNote: "Publicly sourced example; not an official Handprint partner."
        ),
        LocalAction(
            id: "ccap-loaves-fishes-volunteer",
            title: "CCAP/Loaves & Fishes food support shift",
            summary: "Help Berkeley County residents through emergency food support, pantry operations, or food-drive work.",
            category: .foodSupport,
            organizer: "CCAP/Loaves & Fishes",
            trustTier: .pendingReview,
            status: .approved,
            neighborhood: "Martinsburg",
            distanceMiles: 0.7,
            startsAt: "Mon-Fri 10:00 AM",
            daypart: "Weekday",
            duration: "3 hours",
            skills: ["Logistics", "Welcoming", "Packing"],
            impact: "Emergency food assistance for Berkeley County residents",
            capacity: 18,
            attending: 9,
            safetyNote: "Unofficial Handprint example. Pantry roles may involve privacy-sensitive support.",
            reviewNote: "Publicly sourced example; not an official Handprint partner."
        ),
        LocalAction(
            id: "community-service-restore-shift",
            title: "Community service ReStore shift",
            summary: "Help receive, sort, and prepare donated home goods for resale that supports affordable housing work. Court-recognized community service roles require organizer confirmation.",
            category: .communityService,
            organizer: "Habitat ReStore Eastern Panhandle",
            trustTier: .pendingReview,
            status: .approved,
            neighborhood: "Martinsburg",
            distanceMiles: 2.1,
            startsAt: "Sat 10:00 AM",
            daypart: "Saturday morning",
            duration: "3 hours",
            skills: ["Willing hands", "Setup helper", "Reliability"],
            impact: "Donation processing that supports local housing work",
            capacity: 12,
            attending: 6,
            safetyNote: "Unofficial Handprint example. Court-recognized hours require organizer verification and approved role records.",
            reviewNote: "Prototype community-service listing for court-recognized service search.",
            listingType: .action,
            rewardEligible: true,
            handprintPoints: 95
        ),
        LocalAction(
            id: "berkeley-youth-fair-volunteer",
            title: "Berkeley County Youth Fair volunteer support",
            summary: "Help an eight-day youth fair run smoothly through approved volunteer roles tied to youth exhibitors and community operations.",
            category: .mentoring,
            organizer: "Berkeley County Youth Fair",
            trustTier: .pendingReview,
            status: .approved,
            neighborhood: "Martinsburg",
            distanceMiles: 4.3,
            startsAt: "Aug 1-8, 2026",
            daypart: "Flexible",
            duration: "Shift varies",
            skills: ["Welcoming", "Logistics", "Mentoring"],
            impact: "Support for 350+ youth exhibitors and community operations",
            capacity: 60,
            attending: 22,
            safetyNote: "Unofficial Handprint example. Youth-facing roles require safeguards.",
            reviewNote: "Publicly sourced example; not an official Handprint partner."
        ),
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

    static let organizerProfiles: [OrganizerImpactProfile] = [
        OrganizerImpactProfile(
            id: "org-northside-pantry",
            handle: "northside-pantry",
            name: "Northside Community Pantry",
            type: "Food security nonprofit",
            trustTier: .anchorPartner,
            publicSummary: "Recurring pantry shifts that turn volunteer time into packed boxes, cleaner intake, and reliable food access.",
            eventsHosted: 8,
            attendeesMobilized: 146,
            confirmedParticipants: 112,
            volunteerHours: 224,
            handprintPointsIssued: 1240,
            sponsorSlotsUsed: 1,
            sponsorSlotsLimit: 2,
            featuredEventIds: ["food-shelf-saturday"],
            impactHighlights: [
                OrganizerImpactHighlight(label: "Pantry boxes prepared", value: "80"),
                OrganizerImpactHighlight(label: "Confirmed volunteer hours", value: "224"),
                OrganizerImpactHighlight(label: "Repeat helper rate", value: "72%")
            ],
            impactReceiptIds: ["receipt-pantry-boxes-june"],
            grantReadySummary: "Handprint can provide a verified mobilization record: events hosted, attendees confirmed, volunteer hours, points issued, and impact receipts.",
            accolades: [
                OrganizerAccolade(
                    id: "accolade-pantry-mobilizer",
                    title: "Community Mobilizer",
                    category: "Mobilization",
                    description: "Mobilized 100+ confirmed participants through recurring food support actions.",
                    issuedAt: "Jul 2026",
                    evidence: "112 organizer-confirmed participants across 8 pantry events.",
                    status: "approved"
                )
            ]
        ),
        OrganizerImpactProfile(
            id: "org-civic-help-desk",
            handle: "civic-help-desk",
            name: "Civic Help Desk",
            type: "Neighbor navigation group",
            trustTier: .verified,
            publicSummary: "Practical intake and resource navigation sessions for neighbors who need help finding next steps.",
            eventsHosted: 3,
            attendeesMobilized: 42,
            confirmedParticipants: 31,
            volunteerHours: 77,
            handprintPointsIssued: 510,
            sponsorSlotsUsed: 0,
            sponsorSlotsLimit: 1,
            featuredEventIds: ["tenant-rights-clinic"],
            impactHighlights: [
                OrganizerImpactHighlight(label: "Neighbor sessions supported", value: "30"),
                OrganizerImpactHighlight(label: "Confirmed volunteer hours", value: "77"),
                OrganizerImpactHighlight(label: "Sensitive roles protected", value: "Yes")
            ],
            impactReceiptIds: ["receipt-neighbor-intake-june"],
            grantReadySummary: "Handprint can show repeat sessions, verified support roles, organizer confirmations, and practical service outputs without exposing private client details.",
            accolades: [
                OrganizerAccolade(
                    id: "accolade-neighbor-trust",
                    title: "Trusted Intake Partner",
                    category: "Trust",
                    description: "Confirmed sensitive volunteer roles while protecting private neighbor information.",
                    issuedAt: "Jun 2026",
                    evidence: "30 supported sessions confirmed without publishing client-identifying details.",
                    status: "approved"
                )
            ]
        )
    ]

    static let impactReceipts: [ImpactReceipt] = [
        ImpactReceipt(
            id: "receipt-pantry-boxes-june",
            organizerId: "org-northside-pantry",
            eventId: "food-shelf-saturday",
            title: "Saturday food shelf sort",
            beneficiary: "Northside Community Pantry families",
            accomplishment: "80 pantry boxes prepared for Monday distribution.",
            confirmedBy: "Northside Community Pantry",
            issuedAt: "Jun 22",
            evidence: "Roster matched check-in and organizer box count."
        ),
        ImpactReceipt(
            id: "receipt-neighbor-intake-june",
            organizerId: "org-civic-help-desk",
            eventId: "tenant-rights-clinic",
            title: "Neighbor intake desk",
            beneficiary: "Neighbors seeking practical housing help",
            accomplishment: "30 support sessions completed with privacy-preserving confirmation.",
            confirmedBy: "Civic Help Desk",
            issuedAt: "Jun 27",
            evidence: "Organizer confirmed intake desk role and completed session count."
        )
    ]

    static let followedWorldChangers: [FollowedWorldChanger] = [
        FollowedWorldChanger(
            handle: "maya-rivera",
            name: "Maya Rivera",
            tier: "Builder",
            focus: "Cleanup captain",
            recruiting: ["Riverwalk cleanup sprint", "Community mural prep day"],
            following: ["Friends of the Riverwalk", "Block Studio Cooperative"],
            points: 540,
            savedByViewer: true
        ),
        FollowedWorldChanger(
            handle: "jordan-lee",
            name: "Jordan Lee",
            tier: "Helper",
            focus: "Pantry recruiting",
            recruiting: ["Saturday food shelf sort", "CCAP/Loaves & Fishes food support shift"],
            following: ["Northside Community Pantry", "CCAP/Loaves & Fishes"],
            points: 330,
            savedByViewer: true
        ),
        FollowedWorldChanger(
            handle: "sam-patel",
            name: "Sam Patel",
            tier: "Neighbor",
            focus: "Preparedness mentor",
            recruiting: ["Neighborhood preparedness table"],
            following: ["Civic Help Desk"],
            points: 180,
            savedByViewer: true
        )
    ]

    static let reachRewards: [ReachReward] = [
        ReachReward(
            id: "reward-step-forward",
            title: "Step Forward Gear Grant",
            tier: "Capacity",
            category: "Gear",
            description: "Practical shoes, supplies, or transit support that helps a World Changer keep showing up.",
            requirement: "Verified repeat participation and one World Enabler attestation.",
            status: "Pilot ready"
        ),
        ReachReward(
            id: "reward-goody-two-shoes",
            title: "Goody Two Shoes Award",
            tier: "Milestone",
            category: "Sponsor reward",
            description: "A playful walking-heavy service milestone that can unlock a sponsor-backed shoe reward.",
            requirement: "High-mileage, high-service verified actions with anti-gaming review.",
            status: "Sponsor slot"
        ),
        ReachReward(
            id: "reward-helping-hand-scholarship",
            title: "Helping Hand Scholarship",
            tier: "Scholarship I",
            category: "Education",
            description: "A starter scholarship tier for local college, trade, dual-enrollment, or certification costs.",
            requirement: "Verified points, beginner-friendly service record, and consistent participation.",
            status: "Pilot gated"
        ),
        ReachReward(
            id: "reward-steady-hands-scholarship",
            title: "Steady Hands Scholarship",
            tier: "Scholarship II",
            category: "Education",
            description: "A larger scholarship tier for sustained reliability, leadership, and useful community contribution.",
            requirement: "High-trust badges, referral quality, and World Enabler attestations.",
            status: "Pilot gated"
        ),
        ReachReward(
            id: "reward-world-changer-scholarship",
            title: "World Changer Scholarship",
            tier: "Scholarship III",
            category: "Education",
            description: "A top-tier scholarship for exceptional verified impact, leadership, and recruitment.",
            requirement: "Review committee approval, verified impact record, and sponsor funding availability.",
            status: "Pilot gated"
        )
    ]

    static let trainingCredentials: [TrainingCredential] = [
        TrainingCredential(
            id: "credential-first-aid-cpr",
            title: "First Aid / CPR",
            provider: "Red Cross or equivalent partner",
            confidence: "Self-declared",
            status: "Modeled",
            leadershipUnlock: "Eligible for event safety-support roles after document verification.",
            uploadState: "Not uploaded",
            evidenceLabel: "Upload certification card or partner-issued proof."
        ),
        TrainingCredential(
            id: "credential-food-handling",
            title: "Food Handling Basics",
            provider: "Local pantry or public-health partner",
            confidence: "Organizer-attested",
            status: "In review",
            leadershipUnlock: "Eligible for pantry captain and distribution-support roles.",
            uploadState: "In review",
            evidenceLabel: "Pantry supervisor attestation pending."
        ),
        TrainingCredential(
            id: "credential-event-captain",
            title: "Volunteer Captain Training",
            provider: "Handprint organizer network",
            confidence: "Partner-issued",
            status: "Verified",
            leadershipUnlock: "Eligible to lead check-in and post-event confirmation.",
            uploadState: "Verified",
            evidenceLabel: "Issued by Handprint organizer network."
        )
    ]
}
