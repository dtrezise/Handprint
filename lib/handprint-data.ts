import {
  CalendarDays,
  HandHeart,
  HeartHandshake,
  Leaf,
  MapPin,
  Megaphone,
  Paintbrush,
  ShieldCheck,
  Soup,
  Users
} from "lucide-react";

export type EngagementLevel = "Observer" | "Participant" | "Helper" | "Organizer";
export type TrustTier = "Anchor partner" | "Verified" | "Pending review" | "Escalated";
export type EventStatus = "approved" | "pending" | "escalated" | "rejected";
export type RsvpStatus = "saved" | "going" | "checked_in" | "confirmed";

export type EventCategory =
  | "Food support"
  | "Cleanup"
  | "Mentoring"
  | "Mutual aid"
  | "Civic forum"
  | "Arts community"
  | "Preparedness";

export type UserProfile = {
  name: string;
  launchCommunity: string;
  radiusMiles: number;
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
};

export type OrganizerDraft = {
  title: string;
  organizer: string;
  neighborhood: string;
  startsAt: string;
  category: EventCategory;
  summary: string;
  skills: string;
};

export type PublicHighlight = {
  label: string;
  value: string;
};

export const defaultProfile: UserProfile = {
  name: "Dan",
  launchCommunity: "Northside pilot",
  radiusMiles: 5,
  interests: ["Food support", "Mutual aid", "Civic forum", "Arts community"],
  skills: ["Writing", "Logistics", "Mentoring"],
  availability: ["Weeknight", "Saturday morning"],
  engagementLevel: "Helper"
};

export const localActions: LocalAction[] = [
  {
    id: "food-shelf-saturday",
    title: "Saturday food shelf sort",
    summary: "Pack pantry boxes for families before the Monday distribution window.",
    category: "Food support",
    organizer: "Northside Community Pantry",
    trustTier: "Anchor partner",
    status: "approved",
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
    reviewNote: "Anchor organizer with recurring pantry operations.",
    accent: "#d8674c"
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
    distanceMiles: 2.4,
    startsAt: "Sun 8:00 AM",
    daypart: "Weekend morning",
    duration: "90 minutes",
    skills: ["Outdoor work", "Team lead"],
    impact: "3 blocks cleared",
    capacity: 40,
    attending: 22,
    safetyNote: "Gloves supplied. Work stays on public paths.",
    reviewNote: "Verified nonprofit partner.",
    accent: "#4f6f52"
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
    distanceMiles: 0.8,
    startsAt: "Thu 6:00 PM",
    daypart: "Weeknight",
    duration: "2.5 hours",
    skills: ["Writing", "Welcoming", "Spanish helpful"],
    impact: "30 intake sessions supported",
    capacity: 12,
    attending: 8,
    safetyNote: "Public library location with staff present.",
    reviewNote: "Legal-adjacent support. Confirmed as intake only, not legal advice.",
    accent: "#1f7a8c"
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
    distanceMiles: 3.1,
    startsAt: "Wed 5:30 PM",
    daypart: "Weeknight",
    duration: "2 hours",
    skills: ["Writing", "Mentoring"],
    impact: "18 students coached",
    capacity: 10,
    attending: 5,
    safetyNote: "Youth-facing event needs background-check policy review.",
    reviewNote: "Escalated because minors are involved.",
    accent: "#6f4d7c"
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
    distanceMiles: 1.7,
    startsAt: "Tue 7:00 PM",
    daypart: "Weeknight",
    duration: "90 minutes",
    skills: ["Listening", "Questions"],
    impact: "Public priorities captured",
    capacity: 90,
    attending: 41,
    safetyNote: "Moderated forum. No campaign activity allowed in pilot.",
    reviewNote: "Civic forum, non-candidate and non-campaign.",
    accent: "#c99a35"
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
    distanceMiles: 2.0,
    startsAt: "Sat 11:00 AM",
    daypart: "Saturday morning",
    duration: "3 hours",
    skills: ["Setup", "Creative support"],
    impact: "One public wall prepared",
    capacity: 30,
    attending: 19,
    safetyNote: "Outdoor prep. Paint handling instructions provided.",
    reviewNote: "Verified community arts partner.",
    accent: "#d8674c"
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
    distanceMiles: 4.4,
    startsAt: "Mon 6:30 PM",
    daypart: "Weeknight",
    duration: "2 hours",
    skills: ["Logistics", "Packing", "Delivery prep"],
    impact: "60 kits assembled",
    capacity: 28,
    attending: 13,
    safetyNote: "No door-to-door delivery in this shift.",
    reviewNote: "Pending supply-list confirmation.",
    accent: "#4f6f52"
  }
];

export const initialMarks: HandprintMark[] = [
  {
    id: "mark-tenant-confirmed",
    eventId: "tenant-rights-clinic",
    category: "Mutual aid",
    label: "Helped intake desk",
    weight: 4,
    source: "Organizer confirmed"
  },
  {
    id: "mark-budget-checkin",
    eventId: "budget-forum",
    category: "Civic forum",
    label: "Joined budget forum",
    weight: 3,
    source: "Check-in"
  },
  {
    id: "mark-food-confirmed",
    eventId: "food-shelf-saturday",
    category: "Food support",
    label: "Packed pantry boxes",
    weight: 5,
    source: "Organizer confirmed"
  }
];

export const publicHandprintProfile = {
  handle: "dan",
  displayName: "Dan",
  locationLabel: "Northside pilot",
  statement: "Building a visible record of useful local action: food support, civic forums, mutual aid, and creative community work.",
  sharePath: "/u/dan",
  highlights: [
    { label: "Pantry boxes prepared", value: "80" },
    { label: "Public priorities captured", value: "1 forum" },
    { label: "Neighbor intake sessions supported", value: "30" }
  ] satisfies PublicHighlight[]
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

export function nextJoinableActions() {
  return localActions
    .filter((action) => action.status === "approved")
    .filter((action) => !initialMarks.some((mark) => mark.eventId === action.id))
    .slice(0, 3);
}

export function scoreAction(action: LocalAction, profile: UserProfile): Recommendation {
  let score = 0;
  const reasons: string[] = [];

  if (action.distanceMiles <= profile.radiusMiles) {
    score += Math.max(0, 24 - action.distanceMiles * 3);
    reasons.push(action.distanceMiles <= 1.5 ? "Very near you" : "Within your radius");
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

  return {
    id: `mark-${action.id}-${status}`,
    eventId: action.id,
    category: action.category,
    label: `${verb}: ${action.title}`,
    weight,
    source
  };
}

export const categoryIcon = {
  "Food support": Soup,
  Cleanup: Leaf,
  Mentoring: HeartHandshake,
  "Mutual aid": ShieldCheck,
  "Civic forum": Megaphone,
  "Arts community": Paintbrush,
  Preparedness: HandHeart
};

export const statIcon = {
  useful: CalendarDays,
  radius: MapPin,
  verified: ShieldCheck,
  people: Users
};
