import {
  CalendarDays,
  HandHeart,
  HeartHandshake,
  Leaf,
  MapPin,
  Megaphone,
  Paintbrush,
  Scale,
  ShieldCheck,
  Soup,
  Users
} from "lucide-react";

export type EngagementLevel = "Observer" | "Participant" | "Helper" | "Organizer";
export type TrustTier = "Anchor partner" | "Verified" | "Pending review" | "Escalated";
export type EventStatus = "approved" | "pending" | "escalated" | "rejected";
export type RsvpStatus = "saved" | "going" | "checked_in" | "confirmed";
export type BadgeCategory = "Event" | "Skill" | "Training" | "Leadership" | "Referral";
export type CredentialConfidence = "Self-declared" | "Organizer-attested" | "Document-verified" | "Partner-issued";
export type WorldChangerTierName = "Starter" | "Neighbor" | "Helper" | "Builder" | "Anchor" | "World Changer";
export type EventListingType = "action" | "awareness" | "sponsored" | "training" | "fundraiser";
export type ConfirmationStatus = "self_checkin" | "organizer_confirmed" | "beneficiary_attested" | "needs_review";

export type EventCategory =
  | "Food support"
  | "Cleanup"
  | "Mentoring"
  | "Mutual aid"
  | "Civic forum"
  | "Arts community"
  | "Preparedness"
  | "Community service";

export type UserProfile = {
  name: string;
  launchCommunity: string;
  radiusMiles: number;
  rewardsEnabled: boolean;
  interests: EventCategory[];
  skills: string[];
  availability: string[];
  engagementLevel: EngagementLevel;
};

export type LocalAction = {
  id: string;
  title: string;
  summary: string;
  category: EventCategory;
  organizer: string;
  trustTier: TrustTier;
  status: EventStatus;
  neighborhood: string;
  distanceMiles: number;
  startsAt: string;
  daypart: string;
  duration: string;
  skills: string[];
  impact: string;
  capacity: number;
  attending: number;
  safetyNote: string;
  reviewNote: string;
  accent: string;
  reward: EventReward;
  listingType: EventListingType;
  rewardEligible: boolean;
  rewardReason: string;
  impactClaim: string;
  beneficiary: string;
  verificationPlan: string;
  sensitiveReview: boolean;
  sponsorDisclosure?: string;
  fundraiserGoal?: string;
  impactReceiptPlan?: string;
  actionBridge?: string;
  antiGamingNote: string;
  confirmationStatus: ConfirmationStatus;
  unofficialListing?: boolean;
  sourceName?: string;
  sourceUrl?: string;
  realWorldStatus?: string;
};

export type Recommendation = {
  action: LocalAction;
  score: number;
  reasons: string[];
};

export type HandprintMark = {
  id: string;
  eventId: string;
  category: EventCategory;
  label: string;
  weight: number;
  source: "RSVP" | "Check-in" | "Organizer confirmed";
  points: number;
  badgeId?: string;
};

export type OrganizerDraft = {
  title: string;
  organizer: string;
  neighborhood: string;
  startsAt: string;
  category: EventCategory;
  listingType: EventListingType;
  summary: string;
  skills: string;
  beneficiary: string;
  impactClaim: string;
  verificationPlan: string;
  sponsorDisclosure: string;
  fundraiserGoal: string;
  impactReceiptPlan: string;
};

export type PublicHighlight = {
  label: string;
  value: string;
};

export type PublicFocus = {
  title: string;
  description: string;
};

export type PublicQrState = {
  publicId: string;
  enabled: boolean;
  rotatedAt: string;
  fallbackUrl: string;
  designNote: string;
};

export type EventReward = {
  basePoints: number;
  organizerConfirmedBonus: number;
  appreciationCredits: number;
  badgeId?: string;
  rubric: string[];
};

export type RewardBadge = {
  id: string;
  title: string;
  category: BadgeCategory;
  description: string;
  pointsInfluence: number;
  verification: CredentialConfidence;
  issuedBy: string;
  earnedAt?: string;
  accent: string;
  visibilityDefault?: "visible";
  canHide?: boolean;
  visibilityNote?: string;
};

export type ReachRewardCategory = "Recognition" | "Capacity" | "Aspirational" | "Sponsor" | "Community-funded";
export type ReachRewardStatus = "live_pilot" | "funding_required" | "waitlist" | "paused";

export type ReachReward = {
  id: string;
  title: string;
  category: ReachRewardCategory;
  milestone: WorldChangerTierName;
  pointsRequired: number;
  description: string;
  sponsor: string;
  fundingModel: string;
  availability: ReachRewardStatus;
  control: string;
  stewardshipNote: string;
  accent: string;
};

export type TrainingCredential = {
  id: string;
  title: string;
  provider: string;
  confidence: CredentialConfidence;
  status: "modeled" | "earned" | "expired";
  leadershipUnlock: string;
  uploadState: "not_uploaded" | "uploaded" | "in_review" | "verified" | "rejected";
  evidenceLabel: string;
};

export type ReferralState = {
  invited: number;
  confirmedAttendees: number;
  pending: number;
  pointsPerConfirmedReferral: number;
  rule: string;
};

export type OrganizerConfirmation = {
  id: string;
  actionId: string;
  organizer: string;
  status: ConfirmationStatus;
  pointsAwarded: number;
  badgeId?: string;
  evidence: string;
  confirmedAt: string;
};

export type AntiGamingRule = {
  id: string;
  title: string;
  description: string;
};

export type OrganizerAccoladeCategory = "Mobilization" | "Impact" | "Fundraising" | "Trust" | "Sponsor Stewardship";
export type OrganizerOnboardingStatus = "not_started" | "in_progress" | "ready_for_review" | "verified";
export type OrganizerPermissionRole = "viewer" | "organizer_editor" | "handprint_reviewer";

export type TrustReviewNote = {
  id: string;
  createdAt: string;
  author: string;
  note: string;
  status: "info" | "approved" | "hold" | "needs_evidence";
};

export type SponsorSlotAuditEntry = {
  id: string;
  createdAt: string;
  author: string;
  authorRole: OrganizerPermissionRole;
  previousUsed: number;
  nextUsed: number;
  previousLimit: number;
  nextLimit: number;
  note: string;
};

export type OrganizerAccolade = {
  id: string;
  title: string;
  category: OrganizerAccoladeCategory;
  description: string;
  issuedAt: string;
  evidence: string;
  status: "approved" | "pending_review";
  accent: string;
  reviewHistory?: TrustReviewNote[];
};

export type OrganizerImpactHighlight = {
  label: string;
  value: string;
};

export type OrganizerImpactProfile = {
  id: string;
  handle: string;
  name: string;
  type: string;
  trustTier: TrustTier;
  publicSummary: string;
  savedByViewer?: boolean;
  onboardingStatus?: OrganizerOnboardingStatus;
  onboardingSteps?: OrganizerImpactHighlight[];
  permissionRoles?: OrganizerPermissionRole[];
  eventsHosted: number;
  attendeesMobilized: number;
  confirmedParticipants: number;
  volunteerHours: number;
  handprintPointsIssued: number;
  repeatOrganizerRate: number;
  sponsorSlotsUsed: number;
  sponsorSlotsLimit: number;
  sponsorSlotAudit?: SponsorSlotAuditEntry[];
  featuredEventIds: string[];
  impactHighlights: OrganizerImpactHighlight[];
  impactReceiptIds: string[];
  sponsorPolicy: string;
  fundraisingPolicy: string;
  grantReadySummary: string;
  reviewNotes?: TrustReviewNote[];
  accolades: OrganizerAccolade[];
};

export type ImpactReceipt = {
  id: string;
  organizerId: string;
  eventId: string;
  title: string;
  beneficiary: string;
  accomplishment: string;
  confirmedBy: string;
  issuedAt: string;
  evidence: string;
  createdFromConfirmationId?: string;
  nextInviteEventId?: string;
};

export type WorldChangerTier = {
  name: WorldChangerTierName;
  minPoints: number;
  description: string;
};

export const worldChangerTiers: WorldChangerTier[] = [
  {
    name: "Starter",
    minPoints: 0,
    description: "First verified mark."
  },
  {
    name: "Neighbor",
    minPoints: 120,
    description: "Repeated local participation."
  },
  {
    name: "Helper",
    minPoints: 260,
    description: "Reliable contributor across multiple actions."
  },
  {
    name: "Builder",
    minPoints: 520,
    description: "Contributes skills, recruits others, or supports organizers."
  },
  {
    name: "Anchor",
    minPoints: 900,
    description: "Trusted by organizers and consistently confirmed."
  },
  {
    name: "World Changer",
    minPoints: 1400,
    description: "Sustained contribution with breadth, trust, and leadership."
  }
];

export const defaultProfile: UserProfile = {
  name: "Dan",
  launchCommunity: "Martinsburg, WV",
  radiusMiles: 50,
  rewardsEnabled: true,
  interests: ["Food support", "Mutual aid", "Civic forum", "Arts community"],
  skills: ["Writing", "Logistics", "Mentoring"],
  availability: ["Weeknight", "Saturday morning"],
  engagementLevel: "Helper"
};

export const localActions: LocalAction[] = [
  {
    id: "martinsburg-meals-on-wheels-delivery",
    title: "Meals on Wheels delivery route",
    summary: "Deliver hot meals and friendly wellness checks to homebound Berkeley County neighbors.",
    category: "Food support",
    organizer: "Berkeley County Meals on Wheels",
    trustTier: "Pending review",
    status: "approved",
    neighborhood: "Martinsburg",
    distanceMiles: 0.4,
    startsAt: "Weekday lunch routes",
    daypart: "Weekday",
    duration: "1.5 hours",
    skills: ["Driving", "Welcoming", "Reliability"],
    impact: "Hot meals and wellness checks for homebound residents",
    capacity: 30,
    attending: 18,
    safetyNote: "Unofficial Handprint example. Driving roles may require organizer onboarding and route instructions.",
    reviewNote: "Real local opportunity surfaced from public source; not yet registered with Handprint.",
    accent: "#d8674c",
    reward: {
      basePoints: 110,
      organizerConfirmedBonus: 40,
      appreciationCredits: 4,
      badgeId: "badge-meal-route-neighbor",
      rubric: ["Direct food support", "Wellness check", "Named local nonprofit", "Organizer confirmation required"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Handprint-worthy because volunteers deliver meals and human check-ins to homebound neighbors.",
    impactClaim: "Berkeley County Meals on Wheels reports 61,342 meals served in 2025 and daily support for homebound residents.",
    beneficiary: "Homebound and disabled Berkeley County residents",
    verificationPlan: "Would require Meals on Wheels route confirmation before any Handprint points are official.",
    sensitiveReview: true,
    antiGamingNote: "Driving and wellness-check points require route assignment and organizer confirmation.",
    confirmationStatus: "needs_review",
    unofficialListing: true,
    sourceName: "Berkeley County Meals on Wheels",
    sourceUrl: "https://www.berkeleycountymealsonwheels.com/",
    realWorldStatus: "Publicly sourced example; not an official Handprint partner."
  },
  {
    id: "ccap-loaves-fishes-volunteer",
    title: "CCAP/Loaves & Fishes food support shift",
    summary: "Help Berkeley County residents through emergency food support, pantry operations, or food-drive work.",
    category: "Food support",
    organizer: "CCAP/Loaves & Fishes",
    trustTier: "Pending review",
    status: "approved",
    neighborhood: "Martinsburg",
    distanceMiles: 0.7,
    startsAt: "Mon-Fri 10:00 AM",
    daypart: "Weekday",
    duration: "3 hours",
    skills: ["Logistics", "Welcoming", "Packing"],
    impact: "Emergency food assistance for low-income and underserved Berkeley County residents",
    capacity: 18,
    attending: 9,
    safetyNote: "Unofficial Handprint example. Pantry roles may involve privacy-sensitive neighbor support.",
    reviewNote: "Real local opportunity surfaced from public source; not yet registered with Handprint.",
    accent: "#d8674c",
    reward: {
      basePoints: 100,
      organizerConfirmedBonus: 35,
      appreciationCredits: 4,
      badgeId: "badge-pantry-builder",
      rubric: ["Emergency food support", "All-volunteer nonprofit", "Direct household support", "Organizer roster needed"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Handprint-worthy because it directly supports emergency food access for named local beneficiaries.",
    impactClaim: "CCAP/Loaves & Fishes provides emergency food and financial assistance to underserved Berkeley County residents.",
    beneficiary: "Low-income and underserved Berkeley County residents",
    verificationPlan: "Would require CCAP volunteer shift confirmation before official points or badges.",
    sensitiveReview: true,
    antiGamingNote: "Privacy-sensitive pantry work must be confirmed by the organizer and cannot expose client information.",
    confirmationStatus: "needs_review",
    unofficialListing: true,
    sourceName: "CCAP/Loaves & Fishes",
    sourceUrl: "https://ccaploavesandfishes.com/",
    realWorldStatus: "Publicly sourced example; not an official Handprint partner."
  },
  {
    id: "salvation-army-food-pantry-disaster",
    title: "Salvation Army pantry and disaster support",
    summary: "Support food pantry, disaster services, youth programs, grounds work, office help, or seasonal service.",
    category: "Mutual aid",
    organizer: "The Salvation Army Martinsburg Corps",
    trustTier: "Pending review",
    status: "approved",
    neighborhood: "Martinsburg",
    distanceMiles: 1.0,
    startsAt: "Volunteer schedule varies",
    daypart: "Weekday",
    duration: "2 hours",
    skills: ["Packing", "Logistics", "Welcoming"],
    impact: "Program support for Berkeley, Jefferson, and Morgan County communities",
    capacity: 25,
    attending: 11,
    safetyNote: "Unofficial Handprint example. Disaster/youth roles may require additional safeguards.",
    reviewNote: "Real local opportunity surfaced from public source; not yet registered with Handprint.",
    accent: "#1f7a8c",
    reward: {
      basePoints: 90,
      organizerConfirmedBonus: 35,
      appreciationCredits: 3,
      badgeId: "badge-welcome-signal",
      rubric: ["Food pantry or disaster support", "Direct community service", "Role-specific safeguards", "Organizer confirmation required"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Handprint-worthy when the volunteer role is concrete service such as pantry, disaster, youth, or grounds support.",
    impactClaim: "The Martinsburg Corps lists food pantry, disaster services, youth programs, and other volunteer roles.",
    beneficiary: "Berkeley, Jefferson, and Morgan County residents served by Salvation Army programs",
    verificationPlan: "Would require role assignment and post-shift organizer confirmation.",
    sensitiveReview: true,
    antiGamingNote: "Youth/disaster roles need extra review before points are issued.",
    confirmationStatus: "needs_review",
    unofficialListing: true,
    sourceName: "Salvation Army Martinsburg Corps",
    sourceUrl: "https://martinsburg.salvationarmypotomac.org/martinsburg/volunteer-1/",
    realWorldStatus: "Publicly sourced example; not an official Handprint partner."
  },
  {
    id: "united-way-volunteerep-project",
    title: "volunteerEP local project match",
    summary: "Find a nonprofit, school, or government volunteer opportunity across Berkeley, Jefferson, and Morgan Counties.",
    category: "Mutual aid",
    organizer: "United Way of the Eastern Panhandle",
    trustTier: "Pending review",
    status: "approved",
    neighborhood: "Eastern Panhandle",
    distanceMiles: 2.0,
    startsAt: "Opportunities year-round",
    daypart: "Flexible",
    duration: "Varies",
    skills: ["Logistics", "Welcoming", "Questions"],
    impact: "Volunteer matching for community needs across the Eastern Panhandle",
    capacity: 100,
    attending: 44,
    safetyNote: "Unofficial Handprint example. Individual opportunities would need their own Do Something review.",
    reviewNote: "Real local opportunity network surfaced from public source; not yet registered with Handprint.",
    accent: "#c99a35",
    reward: {
      basePoints: 60,
      organizerConfirmedBonus: 25,
      appreciationCredits: 2,
      badgeId: "badge-recruiter-spark",
      rubric: ["Volunteer matching", "Local nonprofit network", "Specific project required", "Confirmation follows host agency"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Handprint-worthy only when the matched opportunity has a concrete service task and host confirmation.",
    impactClaim: "United Way says volunteerEP matches volunteers with nonprofit, school, and government opportunities in Morgan, Berkeley, and Jefferson Counties.",
    beneficiary: "Eastern Panhandle nonprofits, schools, agencies, and residents",
    verificationPlan: "Would require the selected host agency to confirm the actual completed project.",
    sensitiveReview: false,
    antiGamingNote: "Browsing or joining volunteerEP earns nothing; points require confirmed attendance at a specific approved project.",
    confirmationStatus: "needs_review",
    unofficialListing: true,
    sourceName: "United Way of the Eastern Panhandle",
    sourceUrl: "https://uwayep.org/volunteer",
    realWorldStatus: "Publicly sourced example; not an official Handprint partner."
  },
  {
    id: "berkeley-youth-fair-volunteer",
    title: "Berkeley County Youth Fair volunteer support",
    summary: "Help an eight-day youth fair run smoothly through approved volunteer roles tied to youth exhibitors and community operations.",
    category: "Mentoring",
    organizer: "Berkeley County Youth Fair",
    trustTier: "Pending review",
    status: "approved",
    neighborhood: "Martinsburg",
    distanceMiles: 4.3,
    startsAt: "Aug 1-8, 2026",
    daypart: "Flexible",
    duration: "Shift varies",
    skills: ["Welcoming", "Logistics", "Mentoring"],
    impact: "Support for 350+ youth exhibitors and community fair operations",
    capacity: 60,
    attending: 22,
    safetyNote: "Unofficial Handprint example. Youth-facing roles require role clarity and safeguards.",
    reviewNote: "Real dated local event surfaced from public source; not yet registered with Handprint.",
    accent: "#6f4d7c",
    reward: {
      basePoints: 75,
      organizerConfirmedBonus: 30,
      appreciationCredits: 3,
      badgeId: "badge-youth-mentor",
      rubric: ["Dated local event", "Youth/community support", "Role-specific work", "Safeguards required"]
    },
    listingType: "action",
    rewardEligible: false,
    rewardReason: "Potentially Handprint-worthy, but rewards stay locked until youth-facing safeguards and volunteer roles are verified.",
    impactClaim: "The 2026 Berkeley County Youth Fair runs August 1-8 in Martinsburg and highlights 350+ youth exhibitors.",
    beneficiary: "Berkeley County youth exhibitors and fair participants",
    verificationPlan: "Would require a fair volunteer captain to define roles, safeguards, and attendance confirmation.",
    sensitiveReview: true,
    antiGamingNote: "Youth event participation cannot earn points until safeguards and role confirmation are reviewed.",
    confirmationStatus: "needs_review",
    unofficialListing: true,
    sourceName: "Berkeley County Youth Fair",
    sourceUrl: "https://www.berkeleycountyyouthfair.org/",
    realWorldStatus: "Publicly sourced example; not an official Handprint partner."
  },
  {
    id: "habitat-eastern-panhandle-restore",
    title: "Community service ReStore shift",
    summary: "Support donated goods, reuse, and local housing work through a shift that can document community-service hours when the organizer confirms eligibility.",
    category: "Community service",
    organizer: "Habitat for Humanity of the Eastern Panhandle ReStore",
    trustTier: "Pending review",
    status: "approved",
    neighborhood: "Martinsburg",
    distanceMiles: 2.6,
    startsAt: "Tue-Sat daytime",
    daypart: "Weekday",
    duration: "3 hours",
    skills: ["Logistics", "Lifting", "Welcoming"],
    impact: "Donated goods support local housing and home repair work",
    capacity: 20,
    attending: 8,
    safetyNote: "Unofficial Handprint example. Lifting, tools, or repair work may require safety onboarding.",
    reviewNote: "Real local Habitat ReStore listing surfaced from public source; not yet registered with Handprint.",
    accent: "#7a89d8",
    reward: {
      basePoints: 85,
      organizerConfirmedBonus: 30,
      appreciationCredits: 3,
      badgeId: "badge-tool-library-builder",
      rubric: ["Community-service documentation", "Named local ReStore", "Physical/logistics work", "Safety onboarding required"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Handprint-worthy when the role is concrete reuse, donation processing, repair, housing-support work, or documented community-service hours.",
    impactClaim: "Habitat lists an Eastern Panhandle ReStore in Martinsburg; ReStores support affordable housing work through donated goods.",
    beneficiary: "Eastern Panhandle residents supported by Habitat housing and repair work",
    verificationPlan: "Would require ReStore shift confirmation, safety onboarding, and community-service eligibility documentation before official points.",
    sensitiveReview: false,
    antiGamingNote: "Shopping or donating items is not enough for points; volunteer work and community-service hour eligibility must be confirmed.",
    confirmationStatus: "needs_review",
    unofficialListing: true,
    sourceName: "Habitat for Humanity ReStore search",
    sourceUrl: "https://www.habitat.org/local/restore?zip=25411",
    realWorldStatus: "Publicly sourced example; not an official Handprint partner."
  },
  {
    id: "food-shelf-saturday",
    title: "Saturday food shelf sort",
    summary: "Pack pantry boxes for families before the Monday distribution window.",
    category: "Food support",
    organizer: "Northside Community Pantry",
    trustTier: "Anchor partner",
    status: "approved",
    neighborhood: "Northside",
    distanceMiles: 198.0,
    startsAt: "Sat 9:30 AM",
    daypart: "Saturday morning",
    duration: "2 hours",
    skills: ["Logistics", "Lifting", "Welcoming"],
    impact: "80 pantry boxes prepared",
    capacity: 24,
    attending: 17,
    safetyNote: "Indoor shift, closed-toe shoes recommended.",
    reviewNote: "Anchor organizer with recurring pantry operations.",
    accent: "#d8674c",
    reward: {
      basePoints: 90,
      organizerConfirmedBonus: 35,
      appreciationCredits: 3,
      badgeId: "badge-pantry-builder",
      rubric: ["2 hour shift", "Anchor organizer", "Logistics work", "Direct household support"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Earns rewards because participants prepare verified pantry boxes for a named community pantry.",
    impactClaim: "80 pantry boxes prepared for Monday distribution.",
    beneficiary: "Northside Community Pantry families",
    verificationPlan: "Organizer confirms attendance and box count after the shift.",
    sensitiveReview: false,
    antiGamingNote: "Repeat pantry shifts count, but low-effort duplicate check-ins require organizer confirmation.",
    confirmationStatus: "organizer_confirmed"
  },
  {
    id: "river-cleanup",
    title: "Riverwalk cleanup sprint",
    summary: "A fast volunteer cleanup before the Sunday family market opens.",
    category: "Cleanup",
    organizer: "Friends of the Riverwalk",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Old Mill",
    distanceMiles: 201.4,
    startsAt: "Sun 8:00 AM",
    daypart: "Weekend morning",
    duration: "90 minutes",
    skills: ["Outdoor work", "Team lead"],
    impact: "3 blocks cleared",
    capacity: 40,
    attending: 22,
    safetyNote: "Gloves supplied. Work stays on public paths.",
    reviewNote: "Verified nonprofit partner.",
    accent: "#4f6f52",
    reward: {
      basePoints: 65,
      organizerConfirmedBonus: 20,
      appreciationCredits: 2,
      badgeId: "badge-cleanup-crew",
      rubric: ["90 minute shift", "Verified organizer", "Outdoor work", "Public space impact"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Earns rewards because participants clear a public path with a verified organizer.",
    impactClaim: "3 blocks cleared before the Sunday market.",
    beneficiary: "Old Mill riverfront visitors and market vendors",
    verificationPlan: "Organizer confirms cleanup route and participant roster.",
    sensitiveReview: false,
    antiGamingNote: "Cleanup points require assigned route or crew lead confirmation.",
    confirmationStatus: "needs_review"
  },
  {
    id: "tenant-rights-clinic",
    title: "Tenant clinic intake desk",
    summary: "Help neighbors complete intake forms before meeting volunteer advisors.",
    category: "Mutual aid",
    organizer: "Civic Help Desk",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Central Library",
    distanceMiles: 199.2,
    startsAt: "Thu 6:00 PM",
    daypart: "Weeknight",
    duration: "2.5 hours",
    skills: ["Writing", "Welcoming", "Spanish helpful"],
    impact: "30 intake sessions supported",
    capacity: 12,
    attending: 8,
    safetyNote: "Public library location with staff present.",
    reviewNote: "Legal-adjacent support. Confirmed as intake only, not legal advice.",
    accent: "#1f7a8c",
    reward: {
      basePoints: 120,
      organizerConfirmedBonus: 45,
      appreciationCredits: 4,
      badgeId: "badge-neighbor-advocate",
      rubric: ["2.5 hour shift", "Sensitive intake", "Writing skill", "Organizer confirmation weighted"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Earns rewards because participants support verified intake work, not legal advice.",
    impactClaim: "30 neighbor intake sessions supported.",
    beneficiary: "Neighbors seeking tenant support at Civic Help Desk",
    verificationPlan: "Organizer confirms intake desk role and completed session count.",
    sensitiveReview: true,
    antiGamingNote: "Legal-adjacent work only earns points for approved intake roles.",
    confirmationStatus: "organizer_confirmed"
  },
  {
    id: "youth-story-lab",
    title: "Youth story lab mentors",
    summary: "Coach high school students as they shape short stories for a community showcase.",
    category: "Mentoring",
    organizer: "City Arts Youth Lab",
    trustTier: "Pending review",
    status: "escalated",
    neighborhood: "East Arts",
    distanceMiles: 203.1,
    startsAt: "Wed 5:30 PM",
    daypart: "Weeknight",
    duration: "2 hours",
    skills: ["Writing", "Mentoring"],
    impact: "18 students coached",
    capacity: 10,
    attending: 5,
    safetyNote: "Youth-facing event needs background-check policy review.",
    reviewNote: "Escalated because minors are involved.",
    accent: "#6f4d7c",
    reward: {
      basePoints: 140,
      organizerConfirmedBonus: 50,
      appreciationCredits: 4,
      badgeId: "badge-youth-mentor",
      rubric: ["Youth-facing", "Mentoring skill", "Escalated trust review", "Special safeguard required"]
    },
    listingType: "action",
    rewardEligible: false,
    rewardReason: "Rewards locked until youth-safety safeguards and background-check policy are approved.",
    impactClaim: "18 students coached.",
    beneficiary: "City Arts Youth Lab students",
    verificationPlan: "Escalated review before any participation reward can be issued.",
    sensitiveReview: true,
    antiGamingNote: "Youth-facing events cannot earn points until safeguards are verified.",
    confirmationStatus: "needs_review"
  },
  {
    id: "budget-forum",
    title: "Neighborhood budget forum",
    summary: "Join a moderated forum on parks, transit, and library funding priorities.",
    category: "Civic forum",
    organizer: "District Civic Table",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Town Hall Annex",
    distanceMiles: 200.7,
    startsAt: "Tue 7:00 PM",
    daypart: "Weeknight",
    duration: "90 minutes",
    skills: ["Listening", "Questions"],
    impact: "Public priorities captured",
    capacity: 90,
    attending: 41,
    safetyNote: "Moderated forum. No campaign activity allowed in pilot.",
    reviewNote: "Civic forum, non-candidate and non-campaign.",
    accent: "#c99a35",
    reward: {
      basePoints: 55,
      organizerConfirmedBonus: 15,
      appreciationCredits: 2,
      badgeId: "badge-civic-voice",
      rubric: ["90 minute forum", "Verified organizer", "Public priorities captured", "Listening contribution"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Earns rewards because the forum produces an actionable priorities record, not just awareness.",
    impactClaim: "Public priorities captured for parks, transit, and library funding.",
    beneficiary: "District Civic Table planning process",
    verificationPlan: "Moderator publishes priority summary and confirms participant check-in.",
    sensitiveReview: false,
    antiGamingNote: "Forum rewards require documented civic output.",
    confirmationStatus: "self_checkin"
  },
  {
    id: "mural-day",
    title: "Community mural prep day",
    summary: "Prime panels, lay out supplies, and help neighbors prepare a shared mural wall.",
    category: "Arts community",
    organizer: "Block Studio Cooperative",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Market Street",
    distanceMiles: 202.0,
    startsAt: "Sat 11:00 AM",
    daypart: "Saturday morning",
    duration: "3 hours",
    skills: ["Setup", "Creative support"],
    impact: "One public wall prepared",
    capacity: 30,
    attending: 19,
    safetyNote: "Outdoor prep. Paint handling instructions provided.",
    reviewNote: "Verified community arts partner.",
    accent: "#d8674c",
    reward: {
      basePoints: 80,
      organizerConfirmedBonus: 25,
      appreciationCredits: 3,
      badgeId: "badge-community-maker",
      rubric: ["3 hour shift", "Creative support", "Public art prep", "Team setup role"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Earns rewards because participants prepare a shared public art site.",
    impactClaim: "One public wall prepared.",
    beneficiary: "Market Street public art project",
    verificationPlan: "Organizer confirms prep tasks and volunteer roster.",
    sensitiveReview: false,
    antiGamingNote: "Badge requires check-in plus organizer task confirmation.",
    confirmationStatus: "self_checkin"
  },
  {
    id: "welcome-table",
    title: "New neighbor welcome table",
    summary: "Greet new residents, share a short resource map, and collect questions for follow-up by local partners.",
    category: "Mutual aid",
    organizer: "Northside Welcome Network",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Maple Commons",
    distanceMiles: 199.5,
    startsAt: "Fri 5:30 PM",
    daypart: "Weeknight",
    duration: "2 hours",
    skills: ["Welcoming", "Questions", "Logistics"],
    impact: "45 neighbor resource kits shared",
    capacity: 18,
    attending: 9,
    safetyNote: "Public plaza table with partner staff present.",
    reviewNote: "Verified neighborhood coalition partner.",
    accent: "#1f7a8c",
    reward: {
      basePoints: 95,
      organizerConfirmedBonus: 30,
      appreciationCredits: 4,
      badgeId: "badge-welcome-signal",
      rubric: ["2 hour shift", "Welcoming role", "Resource navigation", "Hard-to-fill social labor"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Earns rewards because participants directly help new neighbors find resources.",
    impactClaim: "45 neighbor resource kits shared.",
    beneficiary: "New Northside residents",
    verificationPlan: "Organizer confirms table staffing and resource-kit count.",
    sensitiveReview: false,
    antiGamingNote: "Referral-like social labor requires partner staff confirmation.",
    confirmationStatus: "needs_review"
  },
  {
    id: "tool-library-intake",
    title: "Tool library intake shift",
    summary: "Help catalog donated tools so neighbors can borrow what they need for repairs and garden projects.",
    category: "Preparedness",
    organizer: "Northside Tool Library",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Depot Workshop",
    distanceMiles: 202.8,
    startsAt: "Sat 1:00 PM",
    daypart: "Saturday morning",
    duration: "2.5 hours",
    skills: ["Logistics", "Packing", "Outdoor work"],
    impact: "120 donated tools sorted",
    capacity: 16,
    attending: 7,
    safetyNote: "Gloves and basic handling guidance provided on arrival.",
    reviewNote: "Verified partner with public borrowing hours.",
    accent: "#4f6f52",
    reward: {
      basePoints: 110,
      organizerConfirmedBonus: 35,
      appreciationCredits: 4,
      badgeId: "badge-tool-library-builder",
      rubric: ["2.5 hour shift", "Inventory support", "Repair access", "Preparedness infrastructure"]
    },
    listingType: "action",
    rewardEligible: true,
    rewardReason: "Earns rewards because participants build shared repair capacity through tool intake.",
    impactClaim: "120 donated tools sorted.",
    beneficiary: "Northside Tool Library borrowers",
    verificationPlan: "Organizer confirms inventory shift and donated-tool count.",
    sensitiveReview: false,
    antiGamingNote: "Inventory points require completed batch assignment.",
    confirmationStatus: "needs_review"
  },
  {
    id: "storm-kit-build",
    title: "Storm kit build night",
    summary: "Assemble basic preparedness kits for older neighbors before the late-summer storm season.",
    category: "Preparedness",
    organizer: "Neighborhood Resilience Table",
    trustTier: "Verified",
    status: "pending",
    neighborhood: "West Chapel",
    distanceMiles: 204.4,
    startsAt: "Mon 6:30 PM",
    daypart: "Weeknight",
    duration: "2 hours",
    skills: ["Logistics", "Packing", "Delivery prep"],
    impact: "60 kits assembled",
    capacity: 28,
    attending: 13,
    safetyNote: "No door-to-door delivery in this shift.",
    reviewNote: "Pending supply-list confirmation.",
    accent: "#4f6f52",
    reward: {
      basePoints: 100,
      organizerConfirmedBonus: 30,
      appreciationCredits: 3,
      badgeId: "badge-resilience-ready",
      rubric: ["2 hour shift", "Preparedness", "Pending review", "Older-neighbor support"]
    },
    listingType: "action",
    rewardEligible: false,
    rewardReason: "Rewards pending until the supply list and beneficiary plan are confirmed.",
    impactClaim: "60 preparedness kits assembled.",
    beneficiary: "Older neighbors in West Chapel",
    verificationPlan: "Review supply list, then organizer confirms kit count and shift roster.",
    sensitiveReview: false,
    antiGamingNote: "Preparedness kit points require supply-list confirmation.",
    confirmationStatus: "needs_review"
  },
  {
    id: "no-kings-action-bridge",
    title: "No Kings resource help table",
    summary: "An awareness gathering with a concrete help table for neighbors seeking registration and local resource guidance.",
    category: "Civic forum",
    organizer: "Civic Action Bridge",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Courthouse Plaza",
    distanceMiles: 200.2,
    startsAt: "Sat 10:00 AM",
    daypart: "Saturday morning",
    duration: "3 hours",
    skills: ["Welcoming", "Questions", "Writing"],
    impact: "Public awareness plus direct resource navigation",
    capacity: 80,
    attending: 33,
    safetyNote: "Public plaza. Participation rewards apply only to staffed help-table shifts.",
    reviewNote: "Awareness listing with action bridge. The march itself is awareness-only.",
    accent: "#c99a35",
    reward: {
      basePoints: 0,
      organizerConfirmedBonus: 0,
      appreciationCredits: 0,
      rubric: ["Awareness-only gathering", "Action bridge available", "No march rewards", "Help-table roles reviewed separately"]
    },
    listingType: "awareness",
    rewardEligible: false,
    rewardReason: "Awareness-only events can be discovered in V1, but attendance alone does not earn World Changer rewards.",
    impactClaim: "Resource table helps neighbors find practical next steps.",
    beneficiary: "Neighbors seeking civic and local resource guidance",
    verificationPlan: "Only separate approved help-table shifts can be confirmed for rewards.",
    sensitiveReview: true,
    actionBridge: "Create reward-eligible staffed shifts for resource navigation, cleanup, or direct neighbor support.",
    antiGamingNote: "Awareness attendance cannot be converted into reward points after the fact.",
    confirmationStatus: "needs_review"
  },
  {
    id: "school-supply-fundraiser",
    title: "School supply fundraiser pack-out",
    summary: "Sort funded supply kits and prepare verified delivery bins for neighborhood classrooms.",
    category: "Mutual aid",
    organizer: "Northside Classroom Fund",
    trustTier: "Verified",
    status: "approved",
    neighborhood: "Maple Commons",
    distanceMiles: 199.4,
    startsAt: "Sun 2:00 PM",
    daypart: "Weekend afternoon",
    duration: "2 hours",
    skills: ["Logistics", "Packing", "Welcoming"],
    impact: "75 classroom supply kits packed",
    capacity: 22,
    attending: 14,
    safetyNote: "Indoor packing shift with organizer staff on site.",
    reviewNote: "Verified fundraiser with named beneficiary and delivery plan.",
    accent: "#1f7a8c",
    reward: {
      basePoints: 85,
      organizerConfirmedBonus: 30,
      appreciationCredits: 3,
      badgeId: "badge-classroom-builder",
      rubric: ["Verified fundraiser", "Named beneficiary", "Pack-out labor", "Post-event delivery confirmation"]
    },
    listingType: "fundraiser",
    rewardEligible: true,
    rewardReason: "Earns rewards because participants complete verified pack-out work for a named classroom beneficiary.",
    impactClaim: "75 supply kits packed and staged for delivery.",
    beneficiary: "Northside elementary classrooms",
    verificationPlan: "Organizer uploads delivery receipt and confirms volunteer roster.",
    sensitiveReview: false,
    antiGamingNote: "Donation-only support is not enough for attendance points; pack-out participation must be confirmed.",
    confirmationStatus: "organizer_confirmed"
  },
  {
    id: "sponsored-green-jobs-fair",
    title: "Sponsored green jobs fair",
    summary: "A paid cause promotion for local clean-energy training pathways with optional sign-up coaching.",
    category: "Preparedness",
    organizer: "BrightGrid Community Fund",
    trustTier: "Pending review",
    status: "approved",
    neighborhood: "Civic Center",
    distanceMiles: 203.0,
    startsAt: "Fri 4:00 PM",
    daypart: "Weeknight",
    duration: "2 hours",
    skills: ["Questions", "Welcoming"],
    impact: "Training pathways introduced",
    capacity: 120,
    attending: 51,
    safetyNote: "Sponsored listing. No rewards for viewing promotional content.",
    reviewNote: "Sponsored V1 listing. Reward eligibility requires separate approved coaching shifts.",
    accent: "#4f6f52",
    reward: {
      basePoints: 0,
      organizerConfirmedBonus: 0,
      appreciationCredits: 0,
      rubric: ["Sponsored disclosure", "Awareness only", "Not-interested controls", "Action shifts separated"]
    },
    listingType: "sponsored",
    rewardEligible: false,
    rewardReason: "Sponsored discovery is allowed in V1, but promotion views and attendance do not earn World Changer rewards.",
    impactClaim: "Residents learn about clean-energy training options.",
    beneficiary: "Local job seekers exploring training programs",
    verificationPlan: "Sponsored content reviewed for disclosure and claims; separate coaching shifts need their own rubric.",
    sensitiveReview: false,
    sponsorDisclosure: "Paid promotion by BrightGrid Community Fund.",
    actionBridge: "Create approved coaching, resume help, or training enrollment support shifts.",
    antiGamingNote: "Promotional attendance cannot generate points or appreciation credits.",
    confirmationStatus: "self_checkin"
  }
];

export const initialMarks: HandprintMark[] = [
  {
    id: "mark-tenant-confirmed",
    eventId: "tenant-rights-clinic",
    category: "Mutual aid",
    label: "Helped intake desk",
    weight: 4,
    source: "Organizer confirmed",
    points: 165,
    badgeId: "badge-neighbor-advocate"
  },
  {
    id: "mark-budget-checkin",
    eventId: "budget-forum",
    category: "Civic forum",
    label: "Joined budget forum",
    weight: 3,
    source: "Check-in",
    points: 55,
    badgeId: "badge-civic-voice"
  },
  {
    id: "mark-food-confirmed",
    eventId: "food-shelf-saturday",
    category: "Food support",
    label: "Packed pantry boxes",
    weight: 5,
    source: "Organizer confirmed",
    points: 125,
    badgeId: "badge-pantry-builder"
  },
  {
    id: "mark-mural-checkin",
    eventId: "mural-day",
    category: "Arts community",
    label: "Set up mural prep",
    weight: 3,
    source: "Check-in",
    points: 80,
    badgeId: "badge-community-maker"
  }
];

export const rewardBadges: RewardBadge[] = [
  {
    id: "badge-pantry-builder",
    title: "Pantry Builder",
    category: "Event",
    description: "Prepared pantry boxes through an anchor community food partner.",
    pointsInfluence: 125,
    verification: "Organizer-attested",
    issuedBy: "Northside Community Pantry",
    earnedAt: "Jun 22",
    accent: "#d8674c"
  },
  {
    id: "badge-neighbor-advocate",
    title: "Neighbor Advocate",
    category: "Skill",
    description: "Supported intake for neighbors seeking practical help.",
    pointsInfluence: 165,
    verification: "Organizer-attested",
    issuedBy: "Civic Help Desk",
    earnedAt: "Jun 27",
    accent: "#1f7a8c"
  },
  {
    id: "badge-civic-voice",
    title: "Civic Voice",
    category: "Event",
    description: "Joined a moderated public forum and contributed to local priorities.",
    pointsInfluence: 55,
    verification: "Organizer-attested",
    issuedBy: "District Civic Table",
    earnedAt: "Jul 1",
    accent: "#c99a35"
  },
  {
    id: "badge-community-maker",
    title: "Community Maker",
    category: "Event",
    description: "Helped prepare a shared public art space.",
    pointsInfluence: 80,
    verification: "Organizer-attested",
    issuedBy: "Block Studio Cooperative",
    earnedAt: "Jul 6",
    accent: "#d8674c"
  },
  {
    id: "badge-welcome-signal",
    title: "Welcome Signal",
    category: "Leadership",
    description: "Helped new neighbors find resources and next steps.",
    pointsInfluence: 125,
    verification: "Organizer-attested",
    issuedBy: "Northside Welcome Network",
    accent: "#1f7a8c"
  },
  {
    id: "badge-first-aid-modeled",
    title: "First Aid Ready",
    category: "Training",
    description: "Modeled credential for future Red Cross or equivalent verification.",
    pointsInfluence: 0,
    verification: "Self-declared",
    issuedBy: "Training credential model",
    accent: "#6f4d7c"
  },
  {
    id: "badge-recruiter-spark",
    title: "Recruiter Spark",
    category: "Referral",
    description: "Brings someone who actually attends, not just a clicked invite.",
    pointsInfluence: 0,
    verification: "Organizer-attested",
    issuedBy: "Handprint referral rules",
    accent: "#c99a35"
  },
  {
    id: "badge-classroom-builder",
    title: "Classroom Builder",
    category: "Event",
    description: "Packed verified classroom supply kits for a named school beneficiary.",
    pointsInfluence: 115,
    verification: "Organizer-attested",
    issuedBy: "Northside Classroom Fund",
    accent: "#1f7a8c"
  },
  {
    id: "badge-meal-route-neighbor",
    title: "Meal Route Neighbor",
    category: "Event",
    description: "Delivered meals and wellness checks for homebound neighbors.",
    pointsInfluence: 150,
    verification: "Organizer-attested",
    issuedBy: "Berkeley County Meals on Wheels",
    accent: "#d8674c"
  },
  {
    id: "badge-eastern-panhandle-helper",
    title: "Eastern Panhandle Helper",
    category: "Leadership",
    description: "Completed a verified service project in the Martinsburg area.",
    pointsInfluence: 100,
    verification: "Organizer-attested",
    issuedBy: "Handprint pilot model",
    accent: "#c99a35"
  }
];

export const trainingCredentials: TrainingCredential[] = [
  {
    id: "credential-first-aid-cpr",
    title: "First Aid / CPR",
    provider: "Red Cross or equivalent partner",
    confidence: "Self-declared",
    status: "modeled",
    leadershipUnlock: "Eligible for event safety-support roles after document verification.",
    uploadState: "not_uploaded",
    evidenceLabel: "Upload certification card or partner-issued proof."
  },
  {
    id: "credential-food-handling",
    title: "Food Handling Basics",
    provider: "Local pantry or public-health partner",
    confidence: "Organizer-attested",
    status: "modeled",
    leadershipUnlock: "Eligible for pantry captain and distribution-support roles.",
    uploadState: "in_review",
    evidenceLabel: "Pantry supervisor attestation pending."
  },
  {
    id: "credential-event-captain",
    title: "Volunteer Captain Training",
    provider: "Handprint organizer network",
    confidence: "Partner-issued",
    status: "modeled",
    leadershipUnlock: "Eligible to lead check-in and post-event confirmation.",
    uploadState: "verified",
    evidenceLabel: "Issued by Handprint organizer network."
  }
];

export const publicQrState: PublicQrState = {
  publicId: "hp-dan",
  enabled: true,
  rotatedAt: "2026-07-09",
  fallbackUrl: "/h/hp-dan",
  designNote:
    "V1 uses one conservative high-contrast QR per user that opens the public World Changer page. Revisit a Handprint-shaped QR after scan reliability and accessibility are proven."
};

export const reachRewards: ReachReward[] = [
  {
    id: "reward-goody-two-shoes",
    title: "Goody Two Shoes Award",
    category: "Sponsor",
    milestone: "Helper",
    pointsRequired: 300,
    description: "A sponsor-funded pair of high-quality shoes for someone whose Handprint includes real miles walked, delivered, cleaned, canvassed, or carried.",
    sponsor: "Nike or footwear sponsor",
    fundingModel: "Sponsor-funded first; event registration surplus can fund local alternates.",
    availability: "funding_required",
    control: "Can be paused by market, sponsor, age group, or campaign budget without changing earned badges.",
    stewardshipNote: "Awarded through verified impact plus review, not raw points alone.",
    accent: "#d8674c"
  },
  {
    id: "reward-ready-to-respond",
    title: "Ready to Respond Grant",
    category: "Capacity",
    milestone: "Builder",
    pointsRequired: 520,
    description: "Covers training, certification, equipment, or course fees that help the user qualify for higher-trust service roles.",
    sponsor: "Training partner or local sponsor",
    fundingModel: "Funded by sponsor pool, organizer contributions, or targeted campaign budget.",
    availability: "live_pilot",
    control: "Limit by training category, geography, available funds, and organizer recommendation.",
    stewardshipNote: "This reward expands capacity to do more good instead of acting as a generic prize.",
    accent: "#1f7a8c"
  },
  {
    id: "reward-community-builder-microgrant",
    title: "Community Builder Microgrant",
    category: "Community-funded",
    milestone: "Anchor",
    pointsRequired: 900,
    description: "Small project funding for supplies, space, transportation, or materials tied to a verified local action plan.",
    sponsor: "Handprint community fund",
    fundingModel: "Funded by registration fees, donor pools, and local sponsors.",
    availability: "live_pilot",
    control: "Requires review, budget cap, beneficiary, and after-action confirmation.",
    stewardshipNote: "Money flows toward the next useful action, not toward personal status.",
    accent: "#c99a35"
  },
  {
    id: "reward-local-bridge-scholarship",
    title: "Local Bridge Scholarship",
    category: "Aspirational",
    milestone: "Builder",
    pointsRequired: 650,
    description: "A first scholarship tier for local college, trade, dual-enrollment, or certification costs tied to a verified service path.",
    sponsor: "Local education sponsor",
    fundingModel: "Scholarship pool funded by sponsors, community campaigns, or a capped portion of event registration surplus.",
    availability: "funding_required",
    control: "Requires verified impact, school/training proof, funding availability, and review before award.",
    stewardshipNote: "Designed to help a proven World Changer take the next practical step in capacity and education.",
    accent: "#7a89d8"
  },
  {
    id: "reward-regional-builder-scholarship",
    title: "Regional Builder Scholarship",
    category: "Aspirational",
    milestone: "Anchor",
    pointsRequired: 1000,
    description: "A larger scholarship tier for sustained World Changers whose verified record shows leadership, reliability, and community usefulness.",
    sponsor: "Regional college, foundation, or employer sponsor",
    fundingModel: "Named sponsor or regional scholarship fund with application windows and review committee controls.",
    availability: "waitlist",
    control: "Requires high-trust badges, referral quality, World Enabler attestations, and funding approval.",
    stewardshipNote: "This should feel like an earned expansion of reach, not a popularity contest.",
    accent: "#8b5fbf"
  },
  {
    id: "reward-world-changer-scholarship",
    title: "World Changer Scholarship",
    category: "Aspirational",
    milestone: "World Changer",
    pointsRequired: 1400,
    description: "A top scholarship tier for exceptional verified impact, leadership, and recruitment that can support college, graduate, vocational, or fellowship pathways.",
    sponsor: "National sponsor or Handprint scholarship fund",
    fundingModel: "Sponsor-backed award with legal, tax, youth-safety, and review policies finalized before live issuance.",
    availability: "waitlist",
    control: "Invitation or application only; requires human review, anti-gaming checks, and confirmed funding.",
    stewardshipNote: "The award should honor durable contribution and help the recipient widen the reach of their Handprint.",
    accent: "#d982b5"
  },
  {
    id: "reward-world-awareness-fellowship",
    title: "World Awareness Fellowship",
    category: "Aspirational",
    milestone: "World Changer",
    pointsRequired: 1400,
    description: "A sponsor-backed domestic or international learning trip tied to service, cultural exchange, and practical community understanding.",
    sponsor: "Travel, education, or civic sponsor",
    fundingModel: "Sponsor-funded only until legal, youth-safety, tax, insurance, and chaperone rules are approved.",
    availability: "waitlist",
    control: "Eligibility can be limited, paused, or invitation-only while safety and funding mature.",
    stewardshipNote: "Verified impact unlocks eligibility; final selection requires human review.",
    accent: "#6f4d7c"
  }
];

export const initialOrganizerImpactProfiles: OrganizerImpactProfile[] = [
  {
    id: "org-northside-pantry",
    handle: "northside-pantry",
    name: "Northside Community Pantry",
    type: "Food security nonprofit",
    trustTier: "Anchor partner",
    publicSummary: "Recurring pantry shifts that turn volunteer time into packed boxes, cleaner intake, and reliable food access.",
    savedByViewer: true,
    onboardingStatus: "verified",
    onboardingSteps: [
      { label: "Identity", value: "Verified nonprofit profile" },
      { label: "Event rubric", value: "Do Something plan approved" },
      { label: "Receipts", value: "Post-event receipts enabled" }
    ],
    permissionRoles: ["organizer_editor", "handprint_reviewer"],
    eventsHosted: 8,
    attendeesMobilized: 146,
    confirmedParticipants: 112,
    volunteerHours: 224,
    handprintPointsIssued: 1240,
    repeatOrganizerRate: 72,
    sponsorSlotsUsed: 1,
    sponsorSlotsLimit: 2,
    sponsorSlotAudit: [
      {
        id: "sponsor-audit-pantry-initial",
        createdAt: "Jul 2026",
        author: "Handprint Review",
        authorRole: "handprint_reviewer",
        previousUsed: 0,
        nextUsed: 1,
        previousLimit: 2,
        nextLimit: 2,
        note: "Initial sponsor slot approved for pantry supply visibility."
      }
    ],
    featuredEventIds: ["food-shelf-saturday", "school-supply-fundraiser"],
    impactReceiptIds: ["receipt-pantry-boxes-june", "receipt-classroom-kits-pilot"],
    impactHighlights: [
      { label: "Pantry boxes prepared", value: "80" },
      { label: "Confirmed volunteer hours", value: "224" },
      { label: "Repeat helper rate", value: "72%" }
    ],
    sponsorPolicy: "Sponsors may support pantry supply drives, but sponsored visibility cannot buy Handprint rewards or organizer accolades.",
    fundraisingPolicy: "Fundraising asks focus on the concrete thing being made possible and link to an impact receipt after the event.",
    grantReadySummary:
      "Handprint can provide a verified mobilization record: events hosted, attendees confirmed, volunteer hours, points issued, and impact receipts.",
    reviewNotes: [
      {
        id: "review-note-pantry-anchor",
        createdAt: "Jul 2026",
        author: "Handprint Trust",
        note: "Anchor status based on recurring pantry operations, organizer confirmations, and published impact receipts.",
        status: "approved"
      }
    ],
    accolades: [
      {
        id: "accolade-pantry-mobilizer",
        title: "Community Mobilizer",
        category: "Mobilization",
        description: "Mobilized 100+ confirmed participants through recurring food support actions.",
        issuedAt: "Jul 2026",
        evidence: "112 organizer-confirmed participants across 8 pantry events.",
        status: "approved",
        accent: "#d8674c",
        reviewHistory: [
          {
            id: "history-pantry-mobilizer-approved",
            createdAt: "Jul 2026",
            author: "Handprint Trust",
            note: "Approved after organizer-confirmed participant count crossed 100.",
            status: "approved"
          }
        ]
      },
      {
        id: "accolade-action-receipt",
        title: "Action Receipt Maker",
        category: "Impact",
        description: "Turned completed events into plain-language receipts of what changed.",
        issuedAt: "Jul 2026",
        evidence: "Published impact receipts for pantry packing and classroom kit events.",
        status: "approved",
        accent: "#1f7a8c",
        reviewHistory: [
          {
            id: "history-action-receipt-approved",
            createdAt: "Jul 2026",
            author: "Handprint Trust",
            note: "Approved because receipts identify the action, beneficiary, and plain-language accomplishment.",
            status: "approved"
          }
        ]
      },
      {
        id: "accolade-impact-receipt",
        title: "Impact Receipt Ready",
        category: "Fundraising",
        description: "Can connect fundraising asks to receipts, beneficiary, and post-event impact.",
        issuedAt: "Pilot",
        evidence: "Fundraiser and pantry events include beneficiary, use of funds, and verification plan.",
        status: "pending_review",
        accent: "#c99a35",
        reviewHistory: [
          {
            id: "history-impact-receipt-hold",
            createdAt: "Jul 2026",
            author: "Handprint Trust",
            note: "Held until the next fundraiser has a completed receipt after the event.",
            status: "needs_evidence"
          }
        ]
      }
    ]
  },
  {
    id: "org-civic-help-desk",
    handle: "civic-help-desk",
    name: "Civic Help Desk",
    type: "Neighbor navigation group",
    trustTier: "Verified",
    publicSummary: "Practical intake and resource navigation sessions for neighbors who need help finding next steps.",
    savedByViewer: false,
    onboardingStatus: "verified",
    onboardingSteps: [
      { label: "Identity", value: "Verified community group" },
      { label: "Privacy", value: "Sensitive role safeguards noted" },
      { label: "Receipts", value: "Privacy-preserving receipts enabled" }
    ],
    permissionRoles: ["organizer_editor", "handprint_reviewer"],
    eventsHosted: 3,
    attendeesMobilized: 42,
    confirmedParticipants: 31,
    volunteerHours: 77,
    handprintPointsIssued: 510,
    repeatOrganizerRate: 58,
    sponsorSlotsUsed: 0,
    sponsorSlotsLimit: 1,
    sponsorSlotAudit: [],
    featuredEventIds: ["tenant-rights-clinic"],
    impactReceiptIds: ["receipt-neighbor-intake-june"],
    impactHighlights: [
      { label: "Neighbor sessions supported", value: "30" },
      { label: "Confirmed volunteer hours", value: "77" },
      { label: "Sensitive roles protected", value: "Yes" }
    ],
    sponsorPolicy: "Cause-aligned sponsors can underwrite materials, but targeting stays interest-based and user-controlled.",
    fundraisingPolicy: "No legal or financial claims without review; fundraising copy must state what the dollars make possible.",
    grantReadySummary:
      "Handprint can show repeat sessions, verified support roles, organizer confirmations, and practical service outputs without exposing private client details.",
    reviewNotes: [
      {
        id: "review-note-civic-privacy",
        createdAt: "Jun 2026",
        author: "Handprint Trust",
        note: "Approved with privacy-preserving evidence so neighbor details are not exposed.",
        status: "approved"
      }
    ],
    accolades: [
      {
        id: "accolade-neighbor-trust",
        title: "Trusted Intake Partner",
        category: "Trust",
        description: "Confirmed sensitive volunteer roles while protecting private neighbor information.",
        issuedAt: "Jun 2026",
        evidence: "30 supported sessions confirmed without publishing client-identifying details.",
        status: "approved",
        accent: "#1f7a8c",
        reviewHistory: [
          {
            id: "history-neighbor-trust-approved",
            createdAt: "Jun 2026",
            author: "Handprint Trust",
            note: "Approved because the accolade rewards privacy-respecting confirmation, not public client data.",
            status: "approved"
          }
        ]
      },
      {
        id: "accolade-practical-help",
        title: "Practical Help Maker",
        category: "Impact",
        description: "Turned civic interest into direct assistance rather than awareness alone.",
        issuedAt: "Jun 2026",
        evidence: "Organizer-confirmed intake desk roles and completed support sessions.",
        status: "approved",
        accent: "#6f4d7c",
        reviewHistory: [
          {
            id: "history-practical-help-approved",
            createdAt: "Jun 2026",
            author: "Handprint Trust",
            note: "Approved after organizer confirmation tied civic interest to direct support work.",
            status: "approved"
          }
        ]
      }
    ]
  }
];

export const organizerImpactProfiles = initialOrganizerImpactProfiles;

export const impactReceipts: ImpactReceipt[] = [
  {
    id: "receipt-pantry-boxes-june",
    organizerId: "org-northside-pantry",
    eventId: "food-shelf-saturday",
    title: "Saturday food shelf sort",
    beneficiary: "Northside Community Pantry families",
    accomplishment: "80 pantry boxes prepared for Monday distribution.",
    confirmedBy: "Northside Community Pantry",
    issuedAt: "Jun 22",
    evidence: "Roster matched check-in and organizer box count.",
    nextInviteEventId: "school-supply-fundraiser"
  },
  {
    id: "receipt-classroom-kits-pilot",
    organizerId: "org-northside-pantry",
    eventId: "school-supply-fundraiser",
    title: "Classroom kit pack-out",
    beneficiary: "Northside Elementary classrooms",
    accomplishment: "Classroom kits prepared for a named school beneficiary.",
    confirmedBy: "Northside Classroom Fund",
    issuedAt: "Pending",
    evidence: "Delivery receipt and classroom beneficiary attestation required after pack-out.",
    nextInviteEventId: "food-shelf-saturday"
  },
  {
    id: "receipt-neighbor-intake-june",
    organizerId: "org-civic-help-desk",
    eventId: "tenant-rights-clinic",
    title: "Neighbor intake desk",
    beneficiary: "Neighbors seeking practical housing help",
    accomplishment: "30 support sessions completed with privacy-preserving confirmation.",
    confirmedBy: "Civic Help Desk",
    issuedAt: "Jun 27",
    evidence: "Organizer confirmed intake desk role and completed session count."
  }
];

export const referralState: ReferralState = {
  invited: 14,
  confirmedAttendees: 4,
  pending: 5,
  pointsPerConfirmedReferral: 20,
  rule: "Referral points unlock only when the invited person attends a reward-eligible event and the organizer confirms attendance."
};

export const organizerConfirmations: OrganizerConfirmation[] = [
  {
    id: "confirmation-food-shelf",
    actionId: "food-shelf-saturday",
    organizer: "Northside Community Pantry",
    status: "organizer_confirmed",
    pointsAwarded: 125,
    badgeId: "badge-pantry-builder",
    evidence: "Roster matched check-in and 80 boxes were prepared.",
    confirmedAt: "Jun 22"
  },
  {
    id: "confirmation-tenant-clinic",
    actionId: "tenant-rights-clinic",
    organizer: "Civic Help Desk",
    status: "organizer_confirmed",
    pointsAwarded: 165,
    badgeId: "badge-neighbor-advocate",
    evidence: "Organizer confirmed intake desk role and 30 supported sessions.",
    confirmedAt: "Jun 27"
  },
  {
    id: "confirmation-budget-forum",
    actionId: "budget-forum",
    organizer: "District Civic Table",
    status: "organizer_confirmed",
    pointsAwarded: 55,
    badgeId: "badge-civic-voice",
    evidence: "Moderator check-in matched the attendance roster and the public priorities record was published.",
    confirmedAt: "Jul 1"
  },
  {
    id: "confirmation-mural-day",
    actionId: "mural-day",
    organizer: "Block Studio Cooperative",
    status: "organizer_confirmed",
    pointsAwarded: 80,
    badgeId: "badge-community-maker",
    evidence: "Organizer confirmed mural prep tasks, volunteer roster, and one public wall prepared.",
    confirmedAt: "Jul 6"
  },
  {
    id: "confirmation-fundraiser",
    actionId: "school-supply-fundraiser",
    organizer: "Northside Classroom Fund",
    status: "beneficiary_attested",
    pointsAwarded: 115,
    badgeId: "badge-classroom-builder",
    evidence: "Delivery receipt and classroom beneficiary attestation required after pack-out.",
    confirmedAt: "Pending"
  }
];

export const antiGamingRules: AntiGamingRule[] = [
  {
    id: "rule-confirm-repeat",
    title: "Repeated low-value actions need confirmation",
    description: "After repeated quick check-ins, point value drops unless the organizer confirms a real task or role."
  },
  {
    id: "rule-awareness-zero",
    title: "Awareness-only participation is discoverable, not rewarded",
    description: "Marches, rallies, sponsored events, and pure awareness listings can invite people but do not create points by themselves."
  },
  {
    id: "rule-referral-attendance",
    title: "Referrals count after confirmed attendance",
    description: "Invites do not earn points until the invited person attends a reward-eligible event and confirmation lands."
  }
];

export const publicHandprintProfile = {
  handle: "dan",
  displayName: "Dan",
  locationLabel: "Martinsburg, WV",
  headline: "A living record of the useful things Dan has shown up for around Martinsburg.",
  statement:
    "This Handprint is a public signal of local effort: meals packed, neighbors welcomed, civic questions asked, and small commitments that add up when other people join in.",
  inviteText: "Pick one action, come along, and add your own mark beside this one.",
  sharePath: "/u/dan",
  qr: publicQrState,
  highlights: [
    { label: "Pantry boxes prepared", value: "80" },
    { label: "Neighbor sessions supported", value: "30" },
    { label: "World Changer points", value: "425" }
  ] satisfies PublicHighlight[],
  appreciationCredits: {
    earned: 12,
    spent: 5,
    available: 7,
    label: "Earned appreciation credits"
  },
  currentFocus: [
    {
      title: "Make help easier to find",
      description: "Keep trusted food, mutual-aid, and welcome-table shifts visible before people have to ask around."
    },
    {
      title: "Turn participation into identity",
      description: "Let each completed action become a visible mark people can be proud to share."
    },
    {
      title: "Bring one more person",
      description: "Use each share link as an invitation, not a trophy case."
    }
  ] satisfies PublicFocus[]
};

export function actionById(actionId: string) {
  return localActions.find((action) => action.id === actionId);
}

export function completedHighlights() {
  return initialMarks.map((mark) => ({
    mark,
    action: actionById(mark.eventId)
  }));
}

export function badgeById(badgeId?: string) {
  return rewardBadges.find((badge) => badge.id === badgeId);
}

export function organizerById(organizerId?: string) {
  return organizerImpactProfiles.find((organizer) => organizer.id === organizerId || organizer.handle === organizerId);
}

export function organizerAccoladeById(accoladeId?: string) {
  for (const organizer of organizerImpactProfiles) {
    const accolade = organizer.accolades.find((item) => item.id === accoladeId);
    if (accolade) return { organizer, accolade };
  }
  return undefined;
}

export function impactReceiptById(receiptId?: string) {
  return impactReceipts.find((receipt) => receipt.id === receiptId);
}

export function earnedBadges(marks: HandprintMark[] = initialMarks) {
  return marks
    .map((mark) => badgeById(mark.badgeId))
    .filter((badge): badge is RewardBadge => Boolean(badge));
}

export function totalContributionPoints(marks: HandprintMark[] = initialMarks) {
  return marks.reduce((sum, mark) => sum + mark.points, 0);
}

export function currentWorldChangerTier(points: number) {
  return [...worldChangerTiers].reverse().find((tier) => points >= tier.minPoints) ?? worldChangerTiers[0];
}

export function nextWorldChangerTier(points: number) {
  return worldChangerTiers.find((tier) => tier.minPoints > points);
}

export function worldChangerProgress(marks: HandprintMark[] = initialMarks) {
  const points = totalContributionPoints(marks);
  const currentTier = currentWorldChangerTier(points);
  const nextTier = nextWorldChangerTier(points);
  const progressToNext = nextTier
    ? Math.round(((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100)
    : 100;

  return {
    points,
    currentTier,
    nextTier,
    progressToNext: Math.max(0, Math.min(100, progressToNext))
  };
}

export function nextJoinableActions() {
  return localActions
    .filter((action) => action.status === "approved")
    .filter((action) => action.rewardEligible || action.actionBridge)
    .filter((action) => !initialMarks.some((mark) => mark.eventId === action.id))
    .slice(0, 4);
}

export function scoreAction(action: LocalAction, profile: UserProfile): Recommendation {
  let score = 0;
  const reasons: string[] = [];

  if (action.distanceMiles <= profile.radiusMiles) {
    score += Math.max(0, 30 - action.distanceMiles / 3);
    reasons.push(action.distanceMiles <= 3 ? "Very near you" : "Within your reach");
  }

  if (profile.interests.includes(action.category)) {
    score += 24;
    reasons.push(`Matches ${action.category.toLowerCase()}`);
  }

  const matchedSkills = action.skills.filter((skill) => profile.skills.includes(skill));
  if (matchedSkills.length > 0) {
    score += matchedSkills.length * 12;
    reasons.push(`Uses ${matchedSkills.slice(0, 2).join(" + ")}`);
  }

  if (profile.availability.includes(action.daypart)) {
    score += 16;
    reasons.push(action.daypart);
  }

  if (action.trustTier === "Anchor partner") {
    score += 18;
    reasons.push("Anchor organizer");
  } else if (action.trustTier === "Verified") {
    score += 12;
    reasons.push("Verified organizer");
  } else if (action.trustTier === "Pending review") {
    score -= 18;
    reasons.push("Needs trust review");
  }

  if (action.status === "approved") score += 8;
  if (action.status === "pending") score -= 6;
  if (action.status === "escalated") score -= 24;

  if (action.unofficialListing) {
    score += 80;
    reasons.push("Local sourced example");
  }

  const openness = Math.max(0, action.capacity - action.attending);
  if (openness > 0 && openness <= 8) {
    score += 5;
    reasons.push("Limited spots");
  }

  return { action, score: Math.round(score), reasons: reasons.slice(0, 5) };
}

export function createMark(action: LocalAction, status: RsvpStatus): HandprintMark {
  const source = status === "confirmed" ? "Organizer confirmed" : status === "checked_in" ? "Check-in" : "RSVP";
  const weight = status === "confirmed" ? 5 : status === "checked_in" ? 4 : 2;
  const verb = status === "confirmed" ? "Completed" : status === "checked_in" ? "Checked in" : "RSVP";
  const points = action.rewardEligible
    ? status === "confirmed"
      ? action.reward.basePoints + action.reward.organizerConfirmedBonus
      : status === "checked_in"
        ? action.reward.basePoints
        : Math.round(action.reward.basePoints * 0.25)
    : 0;

  return {
    id: `mark-${action.id}-${status}`,
    eventId: action.id,
    category: action.category,
    label: `${verb}: ${action.title}`,
    weight,
    source,
    points,
    badgeId: action.rewardEligible && status !== "saved" ? action.reward.badgeId : undefined
  };
}

export const categoryIcon = {
  "Food support": Soup,
  Cleanup: Leaf,
  Mentoring: HeartHandshake,
  "Mutual aid": ShieldCheck,
  "Civic forum": Megaphone,
  "Arts community": Paintbrush,
  Preparedness: HandHeart,
  "Community service": Scale
};

export const statIcon = {
  useful: CalendarDays,
  radius: MapPin,
  verified: ShieldCheck,
  people: Users
};
