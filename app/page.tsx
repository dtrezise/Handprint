"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  CircleUserRound,
  ClipboardCheck,
  Copy,
  EyeOff,
  ExternalLink,
  Gift,
  Hand,
  Handshake,
  Heart,
  ListChecks,
  MapPinned,
  Megaphone,
  Minus,
  Plus,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Sparkles,
  Trophy,
  Upload,
  UserCheck
} from "lucide-react";
import { HandprintVisual } from "@/components/HandprintVisual";
import { ShakeNetworkHero } from "@/components/HandshakeNetworkHero";
import { QrCodeCard } from "@/components/QrCodeCard";
import { restoreDialogFocus } from "@/lib/focus-return";
import {
  badgeById,
  categoryIcon,
  createMark,
  defaultProfile,
  earnedBadges,
  initialMarks,
  impactReceipts,
  localActions,
  organizerConfirmations,
  organizerImpactProfiles,
  publicQrState,
  reachRewards,
  referralState,
  scoreAction,
  statIcon,
  trainingCredentials,
  worldChangerProgress,
  type EventCategory,
  type EventStatus,
  type HandprintMark,
  type ImpactReceipt,
  type LocalAction,
  type OrganizerDraft,
  type OrganizerImpactProfile,
  type Recommendation,
  type ReachReward,
  type RewardBadge,
  type RsvpStatus,
  type TrustTier,
  type UserProfile,
  type WorldChangerTierName,
  publicHandprintProfile
} from "@/lib/handprint-data";
import type { OrganizationReviewQueueItem } from "@/lib/server/organizer-ledger";
import type { HandprintSession } from "@/lib/server/session";
import { runtimePath } from "@/lib/runtime-url";
import type {
  AccountControlKind,
  ShareDraft,
  ShareHistoryItem,
  ShareTemplate,
  SocialAccountControl,
  SocialComment,
  SocialLedger,
  SocialMessage,
  SocialModerationReview,
  SocialNotification,
  SocialPreferences,
  SocialReport
} from "@/lib/server/social-ledger";

type Tab = "Reach" | "Print" | "Wave" | "Shake" | "Review";
type PrintMode = "world_changer" | "world_enabler";
type RsvpMap = Record<string, RsvpStatus>;
type OrganizerLoadState = "loading" | "ready" | "error";
type SessionLoadState = "loading" | "ready" | "error";
const SEARCH_FEEDBACK_DELAY_MS = 400;
type KnownCity = {
  label: string;
  lat: number;
  lon: number;
};
type RewardMoment = {
  action: LocalAction;
  mark: HandprintMark;
  badge?: RewardBadge;
  credits: number;
};
type SearchFilters = {
  organizationQuery: string;
  categoryFilter: EventCategory | "All";
  locationFilter: string;
  distanceFilter: number;
  rewardFilter: "all" | "rewards" | "awareness";
  listingTypeFilter: LocalAction["listingType"] | "all";
};
type FollowedWorldChanger = {
  handle: string;
  name: string;
  tier: WorldChangerTierName;
  points: number;
  focus: string;
  recruiting: string[];
  following: string[];
  accent: string;
};
type ProfilePanelItems = {
  interests: EventCategory[];
  skills: string[];
};
type SharePlatform = {
  id: string;
  label: string;
  surface: string;
  aspectRatio: string;
  instruction: string;
  accent: string;
  shareKind: "external-link" | "copy-kit";
  characterLimit: number;
  hashtags: string[];
  renderNotes: string[];
};
type WorldEnablerMilestone = {
  title: string;
  requirement: string;
  status: "complete" | "active" | "locked";
};
type ModerationResult = {
  status: "ready" | "rewrite" | "escalated";
  issues: string[];
  suggestion: string;
};
type SharePostStatus = "draft" | "reviewed" | "ready" | "shared";

const tabs: Tab[] = ["Reach", "Print", "Wave", "Shake"];
const tabLabels: Record<Tab, string> = {
  Reach: "Reach",
  Print: "Print",
  Wave: "Wave",
  Shake: "Shake",
  Review: "Review"
};
const allCategories: EventCategory[] = ["Food support", "Cleanup", "Mentoring", "Mutual aid", "Civic forum", "Arts community", "Preparedness", "Community service"];
const categoryColors: Record<EventCategory, string> = {
  "Food support": "#d8674c",
  Cleanup: "#4f8a62",
  Mentoring: "#8b5fbf",
  "Mutual aid": "#1f8fa3",
  "Civic forum": "#c99a35",
  "Arts community": "#d982b5",
  Preparedness: "#9b6a3f",
  "Community service": "#7a89d8"
};
const skillEnabledColor = "#4f8a62";
const worldChangerRankLabels: Record<string, string> = {
  Starter: "First mark",
  Neighbor: "Local regular",
  Helper: "Reliable contributor",
  Builder: "Skilled builder",
  Anchor: "Trusted anchor",
  "World Changer": "World changer"
};
const knownCities: KnownCity[] = [
  { label: "Martinsburg, WV, USA", lat: 39.4562, lon: -77.9639 },
  { label: "Hagerstown, MD, USA", lat: 39.6418, lon: -77.72 },
  { label: "Winchester, VA, USA", lat: 39.1857, lon: -78.1633 },
  { label: "Frederick, MD, USA", lat: 39.4143, lon: -77.4105 },
  { label: "Washington, DC, USA", lat: 38.9072, lon: -77.0369 },
  { label: "Baltimore, MD, USA", lat: 39.2904, lon: -76.6122 },
  { label: "Philadelphia, PA, USA", lat: 39.9526, lon: -75.1652 },
  { label: "Pittsburgh, PA, USA", lat: 40.4406, lon: -79.9959 },
  { label: "New York, NY, USA", lat: 40.7128, lon: -74.006 },
  { label: "Boston, MA, USA", lat: 42.3601, lon: -71.0589 },
  { label: "Richmond, VA, USA", lat: 37.5407, lon: -77.436 },
  { label: "Charlotte, NC, USA", lat: 35.2271, lon: -80.8431 },
  { label: "Atlanta, GA, USA", lat: 33.749, lon: -84.388 },
  { label: "Nashville, TN, USA", lat: 36.1627, lon: -86.7816 },
  { label: "Chicago, IL, USA", lat: 41.8781, lon: -87.6298 },
  { label: "Detroit, MI, USA", lat: 42.3314, lon: -83.0458 },
  { label: "Columbus, OH, USA", lat: 39.9612, lon: -82.9988 },
  { label: "Cincinnati, OH, USA", lat: 39.1031, lon: -84.512 },
  { label: "St. Louis, MO, USA", lat: 38.627, lon: -90.1994 },
  { label: "Minneapolis, MN, USA", lat: 44.9778, lon: -93.265 },
  { label: "Dallas, TX, USA", lat: 32.7767, lon: -96.797 },
  { label: "Houston, TX, USA", lat: 29.7604, lon: -95.3698 },
  { label: "Austin, TX, USA", lat: 30.2672, lon: -97.7431 },
  { label: "Denver, CO, USA", lat: 39.7392, lon: -104.9903 },
  { label: "Phoenix, AZ, USA", lat: 33.4484, lon: -112.074 },
  { label: "Las Vegas, NV, USA", lat: 36.1699, lon: -115.1398 },
  { label: "Los Angeles, CA, USA", lat: 34.0522, lon: -118.2437 },
  { label: "San Diego, CA, USA", lat: 32.7157, lon: -117.1611 },
  { label: "San Francisco, CA, USA", lat: 37.7749, lon: -122.4194 },
  { label: "Portland, OR, USA", lat: 45.5152, lon: -122.6784 },
  { label: "Seattle, WA, USA", lat: 47.6062, lon: -122.3321 },
  { label: "Honolulu, HI, USA", lat: 21.3099, lon: -157.8581 },
  { label: "Anchorage, AK, USA", lat: 61.2181, lon: -149.9003 },
  { label: "Toronto, ON, Canada", lat: 43.6532, lon: -79.3832 },
  { label: "Vancouver, BC, Canada", lat: 49.2827, lon: -123.1207 },
  { label: "Montreal, QC, Canada", lat: 45.5019, lon: -73.5674 },
  { label: "Mexico City, Mexico", lat: 19.4326, lon: -99.1332 },
  { label: "London, England, UK", lat: 51.5072, lon: -0.1276 },
  { label: "Paris, France", lat: 48.8566, lon: 2.3522 },
  { label: "Berlin, Germany", lat: 52.52, lon: 13.405 },
  { label: "Rome, Italy", lat: 41.9028, lon: 12.4964 },
  { label: "Madrid, Spain", lat: 40.4168, lon: -3.7038 },
  { label: "Amsterdam, Netherlands", lat: 52.3676, lon: 4.9041 },
  { label: "Dublin, Ireland", lat: 53.3498, lon: -6.2603 },
  { label: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { label: "Seoul, South Korea", lat: 37.5665, lon: 126.978 },
  { label: "Singapore", lat: 1.3521, lon: 103.8198 },
  { label: "Sydney, NSW, Australia", lat: -33.8688, lon: 151.2093 },
  { label: "Auckland, New Zealand", lat: -36.8509, lon: 174.7645 },
  { label: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241 },
  { label: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219 },
  { label: "Sao Paulo, Brazil", lat: -23.5558, lon: -46.6396 },
  { label: "Buenos Aires, Argentina", lat: -34.6037, lon: -58.3816 }
];
const allSkills = [
  "Enthusiast",
  "Team spirit",
  "Willing hands",
  "Learner",
  "Friendly welcome",
  "Setup helper",
  "Cleanup helper",
  "Runner",
  "Writing",
  "Logistics",
  "Mentoring",
  "Welcoming",
  "Outdoor work",
  "Questions",
  "Creative support",
  "Packing",
  "Driving",
  "Reliability",
  "Lifting"
];
const immediatelyAvailableSkills = new Set(["Enthusiast", "Team spirit", "Willing hands", "Learner", "Friendly welcome", "Setup helper", "Cleanup helper", "Runner"]);
const skillUnlockNotes: Record<string, string> = {
  Writing: "Locked until writing samples, course work, or World Enabler review verify the skill.",
  Logistics: "Locked until confirmed event support shows dependable coordination.",
  Mentoring: "Locked until training, World Enabler review, and safe-participant checks are complete.",
  Welcoming: "Locked until World Enabler feedback confirms strong first-contact care.",
  "Outdoor work": "Locked until repeated safe participation or World Enabler approval.",
  Questions: "Locked until event feedback confirms helpful intake and guidance.",
  "Creative support": "Locked until examples or World Enabler review verify quality.",
  Packing: "Locked until confirmed shifts show careful supply handling.",
  Driving: "Locked until legal eligibility, license review, and World Enabler approval are complete.",
  Reliability: "Locked until repeated attendance and positive World Enabler ratings are earned.",
  Lifting: "Locked until safety guidance and World Enabler approval are complete."
};
const sharePlatforms: SharePlatform[] = [
  {
    id: "facebook",
    label: "Facebook",
    surface: "Post",
    aspectRatio: "4 / 5",
    instruction: "Public post with link preview, achievement line, and invitation.",
    accent: "#5d7fbf",
    shareKind: "external-link",
    characterLimit: 63206,
    hashtags: ["#Handprint", "#WorldChanger", "#DoSomething"],
    renderNotes: ["4:5 feed-safe card", "Link preview first", "Achievement and invitation visible without opening"]
  },
  {
    id: "instagram-story",
    label: "Instagram",
    surface: "Story",
    aspectRatio: "9 / 16",
    instruction: "Tall story card with QR identity, points, tier, and short prompt.",
    accent: "#d982b5",
    shareKind: "copy-kit",
    characterLimit: 2200,
    hashtags: ["#Handprint", "#WithinReach", "#WorldChanger"],
    renderNotes: ["9:16 vertical safe zones", "Large QR-aware identity area", "Short overlay copy"]
  },
  {
    id: "instagram-reel",
    label: "Instagram",
    surface: "Reel",
    aspectRatio: "9 / 16",
    instruction: "Reel caption and cover prompt built around a recent Handprint mark.",
    accent: "#c96b8f",
    shareKind: "copy-kit",
    characterLimit: 2200,
    hashtags: ["#Handprint", "#UsefulAction", "#WorldChanger"],
    renderNotes: ["9:16 cover frame", "First-line hook", "Recent mark as the story spine"]
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    surface: "Post",
    aspectRatio: "1.91 / 1",
    instruction: "Credibility-first post for service, leadership, and verified contribution.",
    accent: "#4c8aa6",
    shareKind: "external-link",
    characterLimit: 3000,
    hashtags: ["#Handprint", "#ServiceLeadership", "#CommunityImpact"],
    renderNotes: ["Wide link preview", "Verified contribution summary", "Resume-friendly tone"]
  },
  {
    id: "tiktok",
    label: "TikTok",
    surface: "Reel",
    aspectRatio: "9 / 16",
    instruction: "Short caption and hook for a useful-action story.",
    accent: "#72b0a6",
    shareKind: "copy-kit",
    characterLimit: 2200,
    hashtags: ["#Handprint", "#ShowUp", "#DoSomething"],
    renderNotes: ["9:16 hook frame", "Plain-language caption", "Invite into next action"]
  },
  {
    id: "messages",
    label: "Messages",
    surface: "Invite",
    aspectRatio: "1 / 1",
    instruction: "Direct invite with link, plain language, and one clear next action.",
    accent: "#4f8a62",
    shareKind: "copy-kit",
    characterLimit: 500,
    hashtags: ["#Handprint"],
    renderNotes: ["Short direct invite", "Readable URL", "One next action"]
  }
];
const shareTemplates = [
  {
    id: "milestone",
    label: "Milestone",
    message: `I just added another mark to my Handprint. ${publicHandprintProfile.inviteText}`
  },
  {
    id: "recruiting",
    label: "Recruiting",
    message: `I am helping with something useful nearby. ${publicHandprintProfile.inviteText}`
  },
  {
    id: "thanks",
    label: "Thank-you",
    message: "Thank you to everyone who showed up and made this useful action possible."
  },
  {
    id: "impact",
    label: "Impact",
    message: `Useful action is becoming visible on my Handprint. ${publicHandprintProfile.inviteText}`
  }
];
const worldEnablerMilestones: WorldEnablerMilestone[] = [
  { title: "Show up reliably", requirement: "Verified attendance across multiple reward-eligible actions.", status: "complete" },
  { title: "Recruit responsibly", requirement: "Invite people who actually attend and receive positive confirmation.", status: "active" },
  { title: "Learn the rubric", requirement: "Demonstrate clear action, beneficiary, verification, and receipt planning.", status: "active" },
  { title: "Earn trust reviews", requirement: "Receive World Enabler attestations for safety, clarity, and follow-through.", status: "locked" },
  { title: "Open the portal", requirement: "Unlock event creation, confirmations, receipts, and recruitment tools.", status: "locked" }
];
const defaultShareMessage = `I am growing my Handprint through useful action around ${publicHandprintProfile.locationLabel}. ${publicHandprintProfile.inviteText}`;
const postingRules = [
  "Affirm the action or person before criticizing the problem.",
  "Invite useful next steps instead of piling on outrage.",
  "Do not attack, shame, mock, or dehumanize people.",
  "Keep claims tied to what Handprint can verify or link to."
];
const discouragingLanguageRules = [
  {
    pattern: /\b(idiot|idiots|stupid|moron|loser|trash|worthless|clown|shut up)\b/i,
    issue: "Personal attack or mocking language"
  },
  {
    pattern: /\b(hate|destroy|crush|humiliate|ruin them|make them pay)\b/i,
    issue: "Escalating or punitive language"
  },
  {
    pattern: /\b(always|never)\b.*\b(they|them|you people)\b/i,
    issue: "Broad blame that can turn a concern into a pile-on"
  }
];
const skillColors: Record<string, string> = {
  Enthusiast: "#78b57e",
  "Team spirit": "#74a7d8",
  "Willing hands": "#83b88b",
  Learner: "#b79a52",
  "Friendly welcome": "#d982b5",
  "Setup helper": "#69a99a",
  "Cleanup helper": "#4f8a62",
  Runner: "#d9955b",
  Writing: "#8b5fbf",
  Logistics: "#4f91c9",
  Mentoring: "#b56fb0",
  Welcoming: "#d982b5",
  "Outdoor work": "#4f8a62",
  Questions: "#c99a35",
  "Creative support": "#d982b5",
  Packing: "#69a99a",
  Driving: "#7a89d8",
  Reliability: "#c99a35",
  Lifting: "#9b6a3f"
};
const suggestedWorldChangers: FollowedWorldChanger[] = [
  {
    handle: "maya-rivera",
    name: "Maya Rivera",
    tier: "Builder",
    points: 690,
    focus: "Food access, youth mentoring, and practical welcome-table help.",
    recruiting: ["Saturday pantry packing", "First-aid training cohort"],
    following: ["Berkeley County Meals on Wheels", "CCAP/Loaves & Fishes"],
    accent: "#d982b5"
  },
  {
    handle: "jordan-lee",
    name: "Jordan Lee",
    tier: "Helper",
    points: 470,
    focus: "Cleanup crews, tool-library shifts, and neighborhood repair days.",
    recruiting: ["Riverwalk cleanup", "Tool library repair night"],
    following: ["Friends of the Riverwalk", "Habitat ReStore"],
    accent: "#4f8a62"
  },
  {
    handle: "avery-thomas",
    name: "Avery Thomas",
    tier: "Anchor",
    points: 980,
    focus: "Civic help desks, document support, and safe referral pathways.",
    recruiting: ["Civic intake desk", "Community service verification clinic"],
    following: ["Civic Help Desk", "United Way of the Eastern Panhandle"],
    accent: "#7a89d8"
  }
];
const emptyPanelItems: ProfilePanelItems = { interests: [], skills: [] };
const initialProfile: UserProfile = { ...defaultProfile, rewardsEnabled: true, interests: [], skills: [] };
const storageKey = "handprint:first-draft-state:v8";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Reach");
  const [printMode, setPrintMode] = useState<PrintMode>("world_changer");
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [profilePanelItems, setProfilePanelItems] = useState<ProfilePanelItems>(emptyPanelItems);
  const [actions, setActions] = useState<LocalAction[]>(localActions);
  const [selectedId, setSelectedId] = useState(localActions[0].id);
  const [rsvps, setRsvps] = useState<RsvpMap>({ "tenant-rights-clinic": "checked_in" });
  const [marks, setMarks] = useState<HandprintMark[]>(initialMarks);
  const [hydrated, setHydrated] = useState(false);
  const [shareUrl, setShareUrl] = useState(publicHandprintProfile.sharePath);
  const [qrUrl, setQrUrl] = useState(publicQrState.fallbackUrl);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [rewardMoment, setRewardMoment] = useState<RewardMoment | null>(null);
  const [spentCredits, setSpentCredits] = useState(0);
  const [hiddenPromotions, setHiddenPromotions] = useState<string[]>([]);
  const [organizerProfiles, setOrganizerProfiles] = useState<OrganizerImpactProfile[]>(organizerImpactProfiles);
  const [organizerLoadState, setOrganizerLoadState] = useState<OrganizerLoadState>("loading");
  const [impactReceiptRecords, setImpactReceiptRecords] = useState<ImpactReceipt[]>(impactReceipts);
  const [sessionLoadState, setSessionLoadState] = useState<SessionLoadState>("loading");
  const [session, setSession] = useState<HandprintSession | null>(null);
  const [organizationReviewQueue, setOrganizationReviewQueue] = useState<OrganizationReviewQueueItem[]>([]);
  const [socialReviewQueue, setSocialReviewQueue] = useState<SocialModerationReview[]>([]);
  const [socialReportQueue, setSocialReportQueue] = useState<SocialReport[]>([]);
  const [socialNotifications, setSocialNotifications] = useState<SocialNotification[]>([]);
  const unreadSocialCount = socialNotifications.filter((notification) => notification.unread).length;
  const [showDevelopmentTools, setShowDevelopmentTools] = useState(false);
  const [savedOrganizerIds, setSavedOrganizerIds] = useState<string[]>(
    organizerImpactProfiles.filter((profile) => profile.savedByViewer).map((profile) => profile.id)
  );
  const [followedWorldChangerHandles, setFollowedWorldChangerHandles] = useState<string[]>(["maya-rivera"]);

  useEffect(() => {
    const pageParams = new URLSearchParams(window.location.search);
    const developmentMode = pageParams.get("dev") === "1";
    setShowDevelopmentTools(developmentMode);
    if (pageParams.get("review") === "1") setActiveTab("Review");
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as {
        profile?: UserProfile;
        profilePanelItems?: ProfilePanelItems;
        actions?: LocalAction[];
        selectedId?: string;
        rsvps?: RsvpMap;
        marks?: HandprintMark[];
        followedWorldChangerHandles?: string[];
        spentCredits?: number;
        hiddenPromotions?: string[];
      };
      const loadedPanelItems = {
        interests: parsed.profilePanelItems?.interests ?? [],
        skills: (parsed.profilePanelItems?.skills ?? []).filter((skill) => immediatelyAvailableSkills.has(skill))
      };
      const loadedProfile = parsed.profile ?? initialProfile;
      setProfilePanelItems(loadedPanelItems);
      setProfile({
        ...loadedProfile,
        rewardsEnabled: loadedProfile.rewardsEnabled ?? true,
        interests: loadedProfile.interests.filter((item) => loadedPanelItems.interests.includes(item)),
        skills: loadedProfile.skills.filter((item) => loadedPanelItems.skills.includes(item))
      });
      if (parsed.actions?.length) setActions(parsed.actions);
      if (parsed.selectedId) setSelectedId(parsed.selectedId);
      if (parsed.rsvps) setRsvps(parsed.rsvps);
      if (parsed.marks?.length) setMarks(parsed.marks);
      if (parsed.followedWorldChangerHandles) setFollowedWorldChangerHandles(parsed.followedWorldChangerHandles);
      if (typeof parsed.spentCredits === "number") setSpentCredits(Math.max(0, parsed.spentCredits));
      if (parsed.hiddenPromotions) setHiddenPromotions(parsed.hiddenPromotions);
    }
    fetch("/api/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { session?: HandprintSession } | null) => {
        if (payload?.session) setSession(payload.session);
        setSessionLoadState("ready");
      })
      .catch(() => setSessionLoadState("error"));
    fetch("/api/rewards")
      .then((response) => (response.ok ? response.json() : null))
      .then((ledger: { marks?: HandprintMark[]; rsvps?: RsvpMap } | null) => {
        if (!ledger) return;
        if (ledger.marks?.length) setMarks(ledger.marks);
        if (ledger.rsvps) setRsvps(ledger.rsvps);
      })
      .catch(() => undefined);
    fetch("/api/organizers")
      .then((response) => (response.ok ? response.json() : null))
      .then((ledger: { profiles?: OrganizerImpactProfile[] } | null) => {
        if (ledger?.profiles?.length) {
          setOrganizerProfiles(ledger.profiles);
          setSavedOrganizerIds(ledger.profiles.filter((profile) => profile.savedByViewer).map((profile) => profile.id));
        }
        setOrganizerLoadState("ready");
      })
      .catch(() => setOrganizerLoadState("error"));
    fetch("/api/impact-receipts")
      .then((response) => (response.ok ? response.json() : null))
      .then((ledger: { receipts?: ImpactReceipt[] } | null) => {
        if (ledger?.receipts?.length) setImpactReceiptRecords(ledger.receipts);
      })
      .catch(() => undefined);
    fetch("/api/social")
      .then((response) => (response.ok ? response.json() : null))
      .then((ledger: SocialLedger | null) => {
        setSocialNotifications(ledger?.notifications ?? []);
      })
      .catch(() => undefined);
    refreshOrganizationReviewQueue();
    refreshSocialReviewQueue();
    const joinId = pageParams.get("join");
    if (joinId && localActions.some((action) => action.id === joinId)) {
      setSelectedId(joinId);
      setActiveTab("Reach");
      window.history.replaceState(null, "", window.location.pathname);
    }
    setShareUrl(`${window.location.origin}${runtimePath(publicHandprintProfile.sharePath)}`);
    setQrUrl(`${window.location.origin}${runtimePath(publicQrState.fallbackUrl)}`);
    setHydrated(true);
  }, []);

  const permissionRoles = session?.roles ?? [];
  const canEditProfiles = permissionRoles.includes("organizer_editor") || permissionRoles.includes("handprint_reviewer");
  const canReview = permissionRoles.includes("handprint_reviewer");

  const refreshOrganizationReviewQueue = () => {
    fetch("/api/organizers/review-queue")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { items?: OrganizationReviewQueueItem[] } | null) => {
        if (payload?.items) setOrganizationReviewQueue(payload.items);
      })
      .catch(() => undefined);
  };

  const refreshSocialReviewQueue = () => {
    fetch("/api/social/review-queue")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { reviews?: SocialModerationReview[]; reports?: SocialReport[] } | null) => {
        setSocialReviewQueue(payload?.reviews ?? []);
        setSocialReportQueue(payload?.reports ?? []);
      })
      .catch(() => undefined);
  };

  const updateSocialReview = (reviewId: string, decision: "approved" | "rewrite" | "hold", reviewerNote?: string) => {
    setSocialReviewQueue((current) =>
      decision === "approved" ? current.filter((review) => review.id !== reviewId) : current.map((review) => (review.id === reviewId ? { ...review, status: decision === "hold" ? "escalated" : "rewrite" } : review))
    );
    fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review_moderation", reviewId, decision, reviewerNote })
    })
      .then(() => refreshSocialReviewQueue())
      .catch(() => undefined);
  };

  const resolveSocialReport = (reportId: string, status: "resolved" | "reviewing", resolutionNote?: string) => {
    setSocialReportQueue((current) =>
      status === "resolved"
        ? current.filter((report) => report.id !== reportId)
        : current.map((report) => (report.id === reportId ? { ...report, status: "reviewing" } : report))
    );
    fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve_report", reportId, status, resolutionNote })
    })
      .then(() => refreshSocialReviewQueue())
      .catch(() => undefined);
  };

  const updateSessionMode = (mode: "viewer" | "organizer_editor" | "handprint_reviewer" | "pilot_admin") => {
    setSessionLoadState("loading");
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { session?: HandprintSession } | null) => {
        if (payload?.session) setSession(payload.session);
        setSessionLoadState("ready");
      })
      .catch(() => setSessionLoadState("error"));
  };

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ profile, profilePanelItems, actions, selectedId, rsvps, marks, followedWorldChangerHandles, spentCredits, hiddenPromotions })
    );
    fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileHandle: publicHandprintProfile.handle, rsvps, marks })
    }).catch(() => undefined);
  }, [actions, followedWorldChangerHandles, hiddenPromotions, hydrated, marks, profile, profilePanelItems, rsvps, selectedId, spentCredits]);

  const recommendations = useMemo(
    () => actions.map((action) => scoreAction(action, profile)).sort((a, b) => b.score - a.score),
    [actions, profile]
  );

  const selectedAction = useMemo(
    () => actions.find((action) => action.id === selectedId) ?? recommendations[0]?.action ?? actions[0],
    [actions, recommendations, selectedId]
  );

  const selectedRecommendation = useMemo(
    () => recommendations.find((recommendation) => recommendation.action.id === selectedAction.id) ?? scoreAction(selectedAction, profile),
    [profile, recommendations, selectedAction]
  );
  const selectedOrganizer = useMemo(() => organizerForAction(selectedAction, organizerProfiles), [organizerProfiles, selectedAction]);

  const progress = useMemo(() => worldChangerProgress(marks), [marks]);
  const badges = useMemo(() => earnedBadges(marks), [marks]);
  const startingBadgeCount = earnedBadges(initialMarks).length;
  const availableCredits = Math.max(0, publicHandprintProfile.appreciationCredits.available + Math.max(0, badges.length - startingBadgeCount) - spentCredits);

  const addParticipation = (action: LocalAction, status: RsvpStatus) => {
    setSelectedId(action.id);
    setRsvps((current) => ({ ...current, [action.id]: status }));
    const nextMark = createMark(action, status);
    setMarks((current) => {
      const withoutExisting = current.filter((mark) => !(mark.eventId === action.id && mark.source === nextMark.source));
      return [...withoutExisting, nextMark];
    });
    setRewardMoment({
      action,
      mark: nextMark,
      badge: badgeById(nextMark.badgeId),
      credits: action.rewardEligible ? action.reward.appreciationCredits : 0
    });
  };

  const updateActionReview = (actionId: string, status: EventStatus, trustTier?: TrustTier) => {
    setActions((current) =>
      current.map((action) =>
        action.id === actionId
          ? {
              ...action,
              status,
              trustTier: trustTier ?? action.trustTier,
              reviewNote: status === "approved" ? "Approved for pilot listing." : "Requires additional review before public listing."
            }
          : action
      )
    );
  };

  const updateOrganizerProfile = (profileUpdate: Partial<OrganizerImpactProfile> & { id: string }) => {
    setOrganizerProfiles((current) => current.map((profile) => (profile.id === profileUpdate.id ? { ...profile, ...profileUpdate } : profile)));
    fetch("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileUpdate: { ...profileUpdate, actorRole: "organizer_editor" } })
    }).catch(() => undefined);
  };

  const toggleOrganizerSave = (organizer: OrganizerImpactProfile) => {
    const shouldSave = !savedOrganizerIds.includes(organizer.id);
    setSavedOrganizerIds((current) => (shouldSave ? [...current, organizer.id] : current.filter((id) => id !== organizer.id)));
    setOrganizerProfiles((current) =>
      current.map((profileItem) => (profileItem.id === organizer.id ? { ...profileItem, savedByViewer: shouldSave } : profileItem))
    );
    fetch("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpdate: { organizerId: organizer.id, savedByViewer: shouldSave } })
    }).catch(() => undefined);
  };

  const toggleWorldChangerFollow = (handle: string) => {
    setFollowedWorldChangerHandles((current) =>
      current.includes(handle) ? current.filter((item) => item !== handle) : [...current, handle]
    );
  };

  const updateSponsorSlots = (organizerId: string, sponsorSlotsUsed: number, sponsorSlotsLimit: number, note?: string) => {
    setOrganizerProfiles((current) =>
      current.map((profileItem) =>
        profileItem.id === organizerId
          ? {
              ...profileItem,
              sponsorSlotsUsed: Math.max(0, sponsorSlotsUsed),
              sponsorSlotsLimit: Math.max(0, sponsorSlotsLimit)
            }
          : profileItem
      )
    );
    fetch("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sponsorSlotUpdate: { organizerId, sponsorSlotsUsed, sponsorSlotsLimit, actorRole: "handprint_reviewer", note }
      })
    }).catch(() => undefined);
  };

  const addOrganizerReviewNote = (organizerId: string, note: string) => {
    const cleanNote = note.trim();
    if (!cleanNote) return;
    const reviewNote = {
      id: `trust-note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: "Handprint Review",
      note: cleanNote,
      status: "info" as const
    };
    setOrganizerProfiles((current) =>
      current.map((profileItem) =>
        profileItem.id === organizerId ? { ...profileItem, reviewNotes: [reviewNote, ...(profileItem.reviewNotes ?? [])] } : profileItem
      )
    );
    fetch("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewNote: { organizerId, note: cleanNote, actorRole: "handprint_reviewer" } })
    }).catch(() => undefined);
  };

  const updateAccoladeStatus = (organizerId: string, accoladeId: string, status: "approved" | "pending_review", note?: string) => {
    const reviewNote = {
      id: `trust-note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: "Handprint Review",
      note: note?.trim() || `Accolade moved to ${status.replaceAll("_", " ")}.`,
      status: status === "approved" ? ("approved" as const) : ("hold" as const)
    };
    setOrganizerProfiles((current) =>
      current.map((organizer) =>
        organizer.id === organizerId
          ? {
              ...organizer,
              reviewNotes: [reviewNote, ...(organizer.reviewNotes ?? [])],
              accolades: organizer.accolades.map((accolade) =>
                accolade.id === accoladeId ? { ...accolade, status, reviewHistory: [reviewNote, ...(accolade.reviewHistory ?? [])] } : accolade
              )
            }
          : organizer
      )
    );
    fetch("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accoladeUpdate: { organizerId, accoladeId, status, note: reviewNote.note, actorRole: "handprint_reviewer" } })
    }).catch(() => undefined);
  };

  const createImpactReceiptFromConfirmation = (confirmation: (typeof organizerConfirmations)[number]) => {
    const action = actions.find((item) => item.id === confirmation.actionId);
    if (!action) return;
    const organizer = organizerForAction(action, organizerProfiles);
    if (!organizer) return;
    const receipt: ImpactReceipt = {
      id: `receipt-${confirmation.id}`,
      organizerId: organizer.id,
      eventId: action.id,
      title: action.title,
      beneficiary: action.beneficiary,
      accomplishment: action.impactClaim || action.impact,
      confirmedBy: confirmation.organizer,
      issuedAt: confirmation.confirmedAt,
      evidence: confirmation.evidence,
      createdFromConfirmationId: confirmation.id
    };
    setImpactReceiptRecords((current) => {
      const withoutExisting = current.filter((item) => item.id !== receipt.id);
      return [receipt, ...withoutExisting];
    });
    setOrganizerProfiles((current) =>
      current.map((profileItem) =>
        profileItem.id === organizer.id
          ? { ...profileItem, impactReceiptIds: Array.from(new Set([receipt.id, ...profileItem.impactReceiptIds])) }
          : profileItem
      )
    );
    fetch("/api/impact-receipts/confirmations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmationId: confirmation.id })
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { receiptLedger?: { receipts?: ImpactReceipt[] }; organizerLedger?: { profiles?: OrganizerImpactProfile[] } } | null) => {
        if (payload?.receiptLedger?.receipts) setImpactReceiptRecords(payload.receiptLedger.receipts);
        if (payload?.organizerLedger?.profiles) {
          setOrganizerProfiles(payload.organizerLedger.profiles);
          setSavedOrganizerIds(payload.organizerLedger.profiles.filter((profile) => profile.savedByViewer).map((profile) => profile.id));
        }
      })
      .catch(() => undefined);
  };

  const submitDraft = (draft: OrganizerDraft) => {
    const createdAt = Date.now();
    const newAction: LocalAction = {
      id: `draft-${createdAt}`,
      title: draft.title || "Untitled local action",
      summary: draft.summary || "Organizer-submitted action awaiting review.",
      category: draft.category,
      organizer: draft.organizer || "New organizer",
      trustTier: "Pending review",
      status: "pending",
      neighborhood: draft.neighborhood || profile.launchCommunity,
      distanceMiles: 2.6,
      startsAt: draft.startsAt || "Date pending",
      daypart: draft.startsAt.toLowerCase().includes("sat") ? "Saturday morning" : "Weeknight",
      duration: "2 hours",
      skills: draft.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      impact: "Impact pending review",
      capacity: 20,
      attending: 0,
      safetyNote: "Needs pilot safety review.",
      reviewNote: "New organizer submission.",
      accent: "#1f7a8c",
      reward: {
        basePoints: 75,
        organizerConfirmedBonus: 25,
        appreciationCredits: 2,
        rubric: ["Organizer draft", "Admin-reviewed point range", "Pending verification"]
      },
      listingType: draft.listingType,
      rewardEligible: draft.listingType !== "awareness" && draft.listingType !== "sponsored",
      rewardReason:
        draft.listingType === "awareness" || draft.listingType === "sponsored"
          ? "Reach-only until an approved action bridge is reviewed."
          : "Pending admin review against the Do Something rubric.",
      impactClaim: draft.impactClaim || "Impact claim pending organizer detail.",
      beneficiary: draft.beneficiary || "Beneficiary pending review.",
      verificationPlan: draft.verificationPlan || "Organizer must provide a post-event confirmation plan.",
      sensitiveReview: draft.listingType === "awareness",
      sponsorDisclosure: draft.sponsorDisclosure || undefined,
      fundraiserGoal: draft.fundraiserGoal || undefined,
      impactReceiptPlan: draft.impactReceiptPlan || undefined,
      actionBridge:
        draft.listingType === "awareness" || draft.listingType === "sponsored"
          ? "Create a separate reward-eligible shift with direct service, cleanup, training, or practical support."
          : undefined,
      antiGamingNote: "Draft point value is not final until attendance, impact, and organizer confirmation rules are approved.",
      confirmationStatus: "needs_review"
    };
    const existingOrganizer = findDuplicateOrganizerClient(organizerProfiles, newAction.organizer);
    const nextOrganizer: OrganizerImpactProfile = existingOrganizer
      ? {
          ...existingOrganizer,
          featuredEventIds: Array.from(new Set([newAction.id, ...existingOrganizer.featuredEventIds])),
          onboardingStatus: existingOrganizer.onboardingStatus ?? "ready_for_review"
        }
      : createOrganizerProfileFromDraft(draft, newAction.id, createdAt);
    setActions((current) => [newAction, ...current]);
    setOrganizerProfiles((current) => {
      const exists = current.some((organizer) => organizer.id === nextOrganizer.id);
      return exists ? current.map((organizer) => (organizer.id === nextOrganizer.id ? nextOrganizer : organizer)) : [nextOrganizer, ...current];
    });
    setSelectedId(newAction.id);
    setPrintMode("world_enabler");
    setActiveTab("Print");
    fetch("/api/organizers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: nextOrganizer })
    })
      .then(() => refreshOrganizationReviewQueue())
      .catch(() => undefined);
  };

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedShareUrl(true);
    window.setTimeout(() => setCopiedShareUrl(false), 1800);
  };

  return (
    <main className="handprint-dark min-h-screen px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col rounded-lg border border-white/10 bg-white/108 shadow-soft lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:overflow-hidden">
          <div className="shrink-0 border-b border-white/10 p-4">
            <BrandBlock />
            <WorldChangerPanel progress={progress} badgeCount={badges.length} availableCredits={availableCredits} />
          </div>
          <div className="hidden min-h-0 flex-1 overflow-auto p-4 lg:block">
            <ProfilePanel
              profile={profile}
              panelItems={profilePanelItems}
              onProfileChange={setProfile}
              onPanelItemsChange={setProfilePanelItems}
            />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="sticky top-2 z-20 mb-4 rounded-lg border border-white/10 bg-white/92 p-2 shadow-soft backdrop-blur sm:top-5 sm:mb-5">
            <TabNav
              activeTab={activeTab}
              unreadSocialCount={unreadSocialCount}
              reviewQueueCount={socialReviewQueue.length + socialReportQueue.length + organizationReviewQueue.length}
              followingUpdateCount={savedOrganizerIds.length + followedWorldChangerHandles.length}
              onTabChange={setActiveTab}
            />
          </div>
          {activeTab === "Reach" && (
            <DiscoverView
              recommendations={recommendations}
              selectedId={selectedId}
              profile={profile}
              organizerProfiles={organizerProfiles}
              organizerLoadState={organizerLoadState}
              rsvps={rsvps}
              savedOrganizerIds={savedOrganizerIds}
              selectedHidden={hiddenPromotions.includes(selectedAction.id)}
              onSelect={setSelectedId}
              onRsvp={(action) => addParticipation(action, "going")}
              onCheckIn={(action) => addParticipation(action, "checked_in")}
              onNotInterested={() => setHiddenPromotions((current) => Array.from(new Set([...current, selectedAction.id])))}
              onToggleOrganizerSave={(organizer) => organizer && toggleOrganizerSave(organizer)}
            />
          )}
          {activeTab === "Print" && (
            <section className="grid gap-5">
              <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/108 p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                <div className="px-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Print</p>
                  <p className="text-sm font-semibold text-ink/64">The mark you leave, and the opportunities you enable.</p>
                </div>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Choose Handprint role">
                  <button
                    type="button"
                    aria-pressed={printMode === "world_changer"}
                    onClick={() => setPrintMode("world_changer")}
                    className={`min-h-10 rounded-md px-3 text-sm font-semibold ${printMode === "world_changer" ? "bg-gold text-ink" : "border border-white/10 bg-paper text-ink/62"}`}
                  >
                    World Changer
                  </button>
                  <button
                    type="button"
                    aria-pressed={printMode === "world_enabler"}
                    onClick={() => setPrintMode("world_enabler")}
                    className={`min-h-10 rounded-md px-3 text-sm font-semibold ${printMode === "world_enabler" ? "bg-tide text-white" : "border border-white/10 bg-paper text-ink/62"}`}
                  >
                    World Enabler
                  </button>
                </div>
              </div>
              {printMode === "world_changer" ? (
                <ReachView
                  marks={marks}
                  rsvps={rsvps}
                  actions={actions}
                  progress={progress}
                  badges={badges}
                />
              ) : (
                <OrganizerPanel
                  organizerProfiles={organizerProfiles}
                  progress={progress}
                  canEditProfiles={canEditProfiles}
                  onSubmit={submitDraft}
                  onProfileUpdate={updateOrganizerProfile}
                />
              )}
            </section>
          )}
          {activeTab === "Wave" && (
            <ShareView
              shareUrl={shareUrl}
              marks={marks}
              actions={actions}
              progress={progress}
              badges={badges}
              availableCredits={availableCredits}
              qrUrl={qrUrl}
              onSpendCredit={() => setSpentCredits((current) => current + 1)}
              onCopy={copyShareUrl}
              copied={copiedShareUrl}
            />
          )}
          {activeTab === "Shake" && (
            <FollowingOrganizationsView
              organizerProfiles={organizerProfiles}
              savedOrganizerIds={savedOrganizerIds}
              followedWorldChangerHandles={followedWorldChangerHandles}
              onToggleOrganizerSave={toggleOrganizerSave}
              onToggleWorldChangerFollow={toggleWorldChangerFollow}
            />
          )}
          {activeTab === "Review" && (
            <TrustPanel
              actions={actions}
              organizerProfiles={organizerProfiles}
              impactReceipts={impactReceiptRecords}
              organizationReviewQueue={organizationReviewQueue}
              socialReviewQueue={socialReviewQueue}
              socialReportQueue={socialReportQueue}
              canReview={canReview}
              onUpdate={updateActionReview}
              onSocialReview={updateSocialReview}
              onResolveSocialReport={resolveSocialReport}
              onAccoladeStatusChange={updateAccoladeStatus}
              onSponsorSlotChange={updateSponsorSlots}
              onCreateImpactReceipt={createImpactReceiptFromConfirmation}
              onOrganizerReviewNote={addOrganizerReviewNote}
              onSelect={setSelectedId}
            />
          )}
        </section>
      </div>
      {showDevelopmentTools && (
        <DevelopmentFooter session={session} sessionLoadState={sessionLoadState} onSessionModeChange={updateSessionMode} />
      )}
      {rewardMoment && <RewardMomentPanel rewardMoment={rewardMoment} onClose={() => setRewardMoment(null)} />}
    </main>
  );
}

function BrandBlock() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-paper">
        <Hand size={24} />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Handprint</p>
        <h1 className="text-2xl font-semibold leading-tight">Within reach</h1>
      </div>
    </div>
  );
}

function SessionPanel({
  session,
  sessionLoadState,
  onSessionModeChange
}: {
  session: HandprintSession | null;
  sessionLoadState: SessionLoadState;
  onSessionModeChange: (mode: "viewer" | "organizer_editor" | "handprint_reviewer" | "pilot_admin") => void;
}) {
  const label =
    sessionLoadState === "loading"
      ? "Signing in..."
      : sessionLoadState === "error"
        ? "Session unavailable"
        : session?.roles.includes("handprint_reviewer")
          ? "Pilot reviewer"
          : session?.roles.includes("organizer_editor")
            ? "World Enabler editor"
            : "Viewer";

  return (
    <div className="rounded-lg border border-white/10 bg-paper/70 p-3">
      <div className="flex items-center gap-2">
        <ShieldCheck size={17} className="text-moss" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/45">Prototype session</p>
          <p className="text-sm font-semibold">{label}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button"
          onClick={() => onSessionModeChange("pilot_admin")}
          className="min-h-9 rounded-md bg-ink px-2 text-xs font-semibold text-paper"
        >
          Reviewer
        </button>
        <button type="button"
          onClick={() => onSessionModeChange("organizer_editor")}
          className="min-h-9 rounded-md border border-white/10 bg-white/10 px-2 text-xs font-semibold text-paper/72"
        >
          Enabler
        </button>
        <button type="button"
          onClick={() => onSessionModeChange("viewer")}
          className="min-h-9 rounded-md border border-white/10 bg-white/10 px-2 text-xs font-semibold text-paper/72"
        >
          Viewer
        </button>
        <button type="button"
          onClick={() => onSessionModeChange("handprint_reviewer")}
          className="min-h-9 rounded-md border border-white/10 bg-white/10 px-2 text-xs font-semibold text-paper/72"
        >
          Review only
        </button>
      </div>
    </div>
  );
}

function DevelopmentFooter({
  session,
  sessionLoadState,
  onSessionModeChange
}: {
  session: HandprintSession | null;
  sessionLoadState: SessionLoadState;
  onSessionModeChange: (mode: "viewer" | "organizer_editor" | "handprint_reviewer" | "pilot_admin") => void;
}) {
  return (
    <footer className="mx-auto mt-6 max-w-[1500px] rounded-lg border border-dashed border-white/12 bg-white/5 p-4">
      <details>
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.14em] text-paper/58">
          Development tools
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SessionPanel session={session} sessionLoadState={sessionLoadState} onSessionModeChange={onSessionModeChange} />
          <div className="rounded-lg border border-white/10 bg-paper/70 p-3 text-sm leading-6 text-paper/62">
            Prototype-only controls live here so the user-facing panels stay clean. This footer can be collapsed during demos or hidden behind a dev flag later.
          </div>
        </div>
      </details>
    </footer>
  );
}

function WorldChangerPanel({
  progress,
  badgeCount,
  availableCredits
}: {
  progress: ReturnType<typeof worldChangerProgress>;
  badgeCount: number;
  availableCredits: number;
}) {
  const nextLabel = progress.nextTier ? `${progress.nextTier.minPoints - progress.points} points to ${progress.nextTier.name}` : "Top tier unlocked";
  const rankLabel =
    worldChangerRankLabels[progress.currentTier.name] ?? progress.currentTier.description.split(" ").slice(0, 2).join(" ");

  return (
    <div className="mt-4 rounded-lg border border-gold/35 bg-ink p-3 text-paper shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">World Changer</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              href="/profile"
              aria-label="Open profile settings"
              className="inline-grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-paper/78 transition hover:border-tide hover:text-white"
            >
              <CircleUserRound size={18} />
            </Link>
            <h2 className="text-2xl font-semibold leading-tight">{progress.currentTier.name}</h2>
            <p className="text-xs font-semibold text-paper/62">{rankLabel}</p>
          </div>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gold text-ink">
          <Trophy size={19} />
        </span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs font-semibold text-paper/70">
          <span>{progress.points} points</span>
          <span>{nextLabel}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/12">
          <div className="h-2 rounded-full bg-gold" style={{ width: `${progress.progressToNext}%` }} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-white/10 pt-3 text-sm">
        <div className="inline-flex items-center gap-2">
          <Award size={15} className="text-gold" />
          <span className="font-semibold text-paper/60">Badges</span>
          <span className="font-semibold text-paper">{badgeCount}</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Heart size={15} className="text-coral" />
          <span className="font-semibold text-paper/60">Credits</span>
          <span className="font-semibold text-paper">{availableCredits}</span>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ profile, panelItems, onProfileChange, onPanelItemsChange }: { profile: UserProfile; panelItems: ProfilePanelItems; onProfileChange: (profile: UserProfile) => void; onPanelItemsChange: (items: ProfilePanelItems) => void }) {
  const toggleCategory = (category: EventCategory) => {
    const interests = profile.interests.includes(category)
      ? profile.interests.filter((item) => item !== category)
      : [...profile.interests, category];
    onProfileChange({ ...profile, interests });
  };

  const toggleSkill = (skill: string) => {
    const skills = profile.skills.includes(skill) ? profile.skills.filter((item) => item !== skill) : [...profile.skills, skill];
    onProfileChange({ ...profile, skills });
  };
  const updateDisplayedInterests = (interests: EventCategory[]) => {
    onPanelItemsChange({ ...panelItems, interests });
    onProfileChange({ ...profile, interests: profile.interests.filter((item) => interests.includes(item)) });
  };
  const updateDisplayedSkills = (skills: string[]) => {
    const unlockedSkills = skills.filter((skill) => immediatelyAvailableSkills.has(skill));
    onPanelItemsChange({ ...panelItems, skills: unlockedSkills });
    onProfileChange({ ...profile, skills: profile.skills.filter((item) => unlockedSkills.includes(item)) });
  };

  return (
    <div className="grid gap-3">
      <ChipEditor
        title="Interests"
        items={allCategories}
        displayedItems={panelItems.interests}
        active={profile.interests}
        onToggle={toggleCategory}
        onDisplayedItemsChange={updateDisplayedInterests}
        chipStyle={(item) => chipStyle(categoryColors[item], profile.interests.includes(item))}
        activeStyle={(item) => activeChipStyle(categoryColors[item])}
        className="min-h-[192px]"
      />
      <ChipEditor
        title="Skills"
        items={allSkills}
        displayedItems={panelItems.skills}
        active={profile.skills}
        onToggle={toggleSkill}
        onDisplayedItemsChange={updateDisplayedSkills}
        disabledItems={allSkills.filter((skill) => !immediatelyAvailableSkills.has(skill))}
        itemNote={(skill) => skillUnlockNotes[skill]}
        chipStyle={(skill) => chipStyle(skillColor(skill), profile.skills.includes(skill))}
        activeStyle={() => activeChipStyle(skillEnabledColor)}
        className="min-h-[360px]"
      />
    </div>
  );
}

function ChipEditor<T extends string>({
  title,
  items,
  displayedItems,
  active,
  onToggle,
  onDisplayedItemsChange,
  disabledItems = [],
  itemNote,
  chipStyle,
  className = "",
  activeStyle
}: {
  title: string;
  items: T[];
  displayedItems?: T[];
  active: T[];
  onToggle: (item: T) => void;
  onDisplayedItemsChange?: (items: T[]) => void;
  disabledItems?: T[];
  itemNote?: (item: T) => string | undefined;
  chipStyle?: (item: T, isActive: boolean) => CSSProperties;
  className?: string;
  activeStyle?: (item: T) => CSSProperties;
}) {
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const getActiveStyle = activeStyle ?? (() => activeChipStyle(skillEnabledColor));
  const disabledSet = new Set(disabledItems);
  const visibleItems = displayedItems ?? items;
  const chooserSelections = displayedItems ?? active;
  const canClear = onDisplayedItemsChange ? visibleItems.length > 0 : active.length > 0;
  const togglePanelItem = (item: T) => {
    if (disabledSet.has(item)) return;
    if (!onDisplayedItemsChange) {
      onToggle(item);
      return;
    }
    const nextItems = chooserSelections.includes(item) ? chooserSelections.filter((current) => current !== item) : [...chooserSelections, item];
    onDisplayedItemsChange(nextItems);
  };
  const clearItems = () => {
    if (onDisplayedItemsChange) {
      onDisplayedItemsChange([]);
      return;
    }
    active.forEach((item) => onToggle(item));
  };

  return (
    <section className={`rounded-lg border border-white/10 bg-paper p-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/45">{title}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Select ${title.toLowerCase()}`}
            onClick={() => setIsChooserOpen(true)}
            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-paper/72 transition hover:bg-white/12"
          >
            Select
          </button>
          <button
            type="button"
            aria-label={`Clear ${title.toLowerCase()}`}
            onClick={clearItems}
            disabled={!canClear}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              canClear
                ? "border-moss/30 bg-moss/10 text-paper/80 hover:bg-moss/20"
                : "cursor-not-allowed border-white/10 bg-transparent text-paper/25"
            }`}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {visibleItems.map((item) => {
          const isActive = active.includes(item);
          return (
            <button type="button"
              key={item}
              aria-pressed={isActive}
              onClick={() => onToggle(item)}
              style={chipStyle ? chipStyle(item, isActive) : isActive ? getActiveStyle(item) : undefined}
              className={`inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition ${
                isActive ? "border border-transparent text-white shadow-sm" : "border border-white/10 text-paper/72 hover:brightness-110"
              }`}
            >
              {item}
            </button>
          );
        })}
        {!visibleItems.length && (
          <div className="rounded-md border border-dashed border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-paper/40">
            Select {title.toLowerCase()} to show toggles here.
          </div>
        )}
      </div>
      {isChooserOpen && (
        <ChoiceModal
          title={title}
          items={items}
          selected={chooserSelections}
          onToggle={togglePanelItem}
          activeStyle={getActiveStyle}
          choiceStyle={chipStyle}
          disabledItems={disabledItems}
          itemNote={itemNote}
          mode={onDisplayedItemsChange ? "display" : "active"}
          onClose={() => setIsChooserOpen(false)}
        />
      )}
    </section>
  );
}

function ChoiceModal<T extends string>({
  title,
  items,
  selected,
  onToggle,
  activeStyle,
  choiceStyle,
  disabledItems = [],
  itemNote,
  mode,
  onClose
}: {
  title: string;
  items: T[];
  selected: T[];
  onToggle: (item: T) => void;
  activeStyle: (item: T) => CSSProperties;
  choiceStyle?: (item: T, isActive: boolean) => CSSProperties;
  disabledItems?: T[];
  itemNote?: (item: T) => string | undefined;
  mode: "display" | "active";
  onClose: () => void;
}) {
  const disabledSet = new Set(disabledItems);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      restoreDialogFocus(previousFocus);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="choice-modal-title"
        style={{ height: "min(560px, calc(100vh - 64px))" }}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111b18] shadow-soft"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Approved {title}</p>
            <h3 id="choice-modal-title" className="mt-1 text-xl font-semibold">Choose {title.toLowerCase()}</h3>
            <p className="mt-2 text-xs leading-5 text-paper/60">
              {mode === "display" ? "Checked items appear in your panel. Use the panel chips afterward to turn search matching on or off." : "Checked items are active for search matching."}
            </p>
          </div>
          <button type="button" autoFocus onClick={onClose} className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-paper/72">
            Done
          </button>
        </div>
        <div className="grid gap-2 overflow-y-auto p-4">
          {items.map((item) => {
            const isSelected = selected.includes(item);
            const isDisabled = disabledSet.has(item);
            const note = itemNote?.(item);
            const visualStyle =
              !isDisabled && choiceStyle
                ? choiceStyle(item, isSelected)
                : mode === "active" && isSelected
                  ? activeStyle(item)
                  : undefined;
            return (
              <label
                key={item}
                aria-disabled={isDisabled}
                onClick={(event) => {
                  if (isDisabled) event.preventDefault();
                }}
                style={visualStyle}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm font-semibold transition ${
                  isDisabled
                    ? "cursor-not-allowed border-white/10 bg-white/5 text-paper/30"
                    : isSelected
                      ? "border-white/20 bg-white/20 text-white"
                      : "border-white/10 bg-white/10 text-paper/90 hover:bg-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onToggle(item)}
                  className="h-4 w-4 accent-[#4f8a62] disabled:accent-white/20"
                />
                <span>
                  {item}
                  {note && <span className="mt-1 block text-[11px] leading-4 text-paper/40">{note}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatsGrid({ stats, className = "" }: { stats: { label: string; value: string; icon: typeof ListChecks }[]; className?: string }) {
  return (
    <div data-testid="results-stat-strip" className={`flex min-h-9 flex-nowrap items-center gap-x-4 overflow-x-auto whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-paper/62 ${className}`}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="inline-flex items-center gap-1.5">
            <Icon size={14} className="text-tide" />
            <span className="text-paper">{stat.value}</span>
            <span>{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function actionTaskSummary(action: LocalAction) {
  const skills = action.skills.slice(0, 2).join(" + ");
  if (action.listingType === "awareness") return action.actionBridge ?? "Join the cause, then look for a connected hands-on action that can earn rewards.";
  if (action.listingType === "training") return `Learn or practice ${skills || "a useful skill"} so you can take on higher-trust roles later.`;
  if (action.listingType === "fundraiser") return `Help with the concrete pack-out, delivery, or support work tied to this fundraiser.`;
  if (action.listingType === "sponsored") return "Explore the sponsored opportunity, then choose a separate verified action if you want Handprint rewards.";
  return `Show up for ${action.duration.toLowerCase()} and help with ${skills || action.category.toLowerCase()} work.`;
}

function actionAfterSummary(action: LocalAction) {
  if (action.unofficialListing) return "Handprint must verify the World Enabler before this can become an official mark.";
  if (action.rewardEligible) return "After confirmation, this can become points, a badge, and proof on your Handprint.";
  return "After review, a connected action bridge may become reward-eligible.";
}

function actionOfficialLabel(action: LocalAction) {
  if (action.unofficialListing) return "Unofficial example";
  if (action.status === "approved" && action.rewardEligible) return "Official Handprint";
  if (!action.rewardEligible) return action.listingType === "sponsored" ? "Sponsored discovery" : "Awareness only";
  return "Needs trust review";
}

function actionOfficialTone(action: LocalAction) {
  if (action.unofficialListing) return "border-tide/25 bg-tide/10 text-tide";
  if (action.status === "approved" && action.rewardEligible) return "border-moss/25 bg-moss/12 text-moss";
  if (!action.rewardEligible) return "border-gold/25 bg-gold/10 text-gold";
  return "border-coral/25 bg-coral/10 text-coral";
}

function TabNav({
  activeTab,
  unreadSocialCount,
  reviewQueueCount,
  followingUpdateCount,
  onTabChange
}: {
  activeTab: Tab;
  unreadSocialCount: number;
  reviewQueueCount: number;
  followingUpdateCount: number;
  onTabChange: (tab: Tab) => void;
}) {
  const badgeForTab = (tab: Tab) => {
    if (tab === "Wave") return unreadSocialCount;
    if (tab === "Review") return reviewQueueCount;
    if (tab === "Shake") return followingUpdateCount;
    return 0;
  };

  const iconForTab = (tab: Tab) => {
    if (tab === "Reach") return <Radar size={17} />;
    if (tab === "Print") return <Hand size={17} />;
    if (tab === "Wave") return <Megaphone size={17} />;
    if (tab === "Shake") return <Handshake size={17} />;
    return <ShieldCheck size={17} />;
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {tabs.map((tab) => {
        const badge = badgeForTab(tab);
        return (
          <button
            key={tab}
            type="button"
            data-testid={`tab-${tab.toLowerCase().replaceAll(" ", "-")}`}
            aria-label={badge > 0 ? `${tabLabels[tab]}, ${badge > 99 ? "99 or more" : badge} update${badge === 1 ? "" : "s"}` : tabLabels[tab]}
            aria-pressed={activeTab === tab}
            onClick={() => onTabChange(tab)}
            className={`relative inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:text-sm ${
              activeTab === tab ? "bg-ink text-paper" : "border border-ink/10 bg-white text-ink/68 hover:bg-paper"
            }`}
          >
            {iconForTab(tab)}
            {tabLabels[tab]}
            {badge > 0 && (
              <span aria-hidden="true" className="ml-2 inline-flex min-w-5 justify-center rounded-full bg-coral px-1.5 py-0.5 text-[10px] font-bold text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DiscoverView({
  recommendations,
  selectedId,
  profile,
  organizerProfiles,
  organizerLoadState,
  rsvps,
  savedOrganizerIds,
  selectedHidden,
  onSelect,
  onRsvp,
  onCheckIn,
  onNotInterested,
  onToggleOrganizerSave
}: {
  recommendations: Recommendation[];
  selectedId: string;
  profile: UserProfile;
  organizerProfiles: OrganizerImpactProfile[];
  organizerLoadState: OrganizerLoadState;
  rsvps: RsvpMap;
  savedOrganizerIds: string[];
  selectedHidden: boolean;
  onSelect: (id: string) => void;
  onRsvp: (action: LocalAction) => void;
  onCheckIn: (action: LocalAction) => void;
  onNotInterested: () => void;
  onToggleOrganizerSave: (organizer?: OrganizerImpactProfile) => void;
}) {
  const [organizationQuery, setOrganizationQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "All">("All");
  const [locationFilter, setLocationFilter] = useState(profile.launchCommunity);
  const [distanceFilter, setDistanceFilter] = useState(profile.radiusMiles);
  const [rewardFilter, setRewardFilter] = useState<"all" | "rewards" | "awareness">("all");
  const [listingTypeFilter, setListingTypeFilter] = useState<LocalAction["listingType"] | "all">("all");
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const searchTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current);
    },
    []
  );
  useEffect(() => {
    setLocationFilter(profile.launchCommunity);
    setDistanceFilter(profile.radiusMiles);
  }, [profile.launchCommunity, profile.radiusMiles]);
  const cleanQuery = organizationQuery.trim().toLowerCase();
  const currentFilters: SearchFilters = {
    organizationQuery,
    categoryFilter,
    locationFilter,
    distanceFilter,
    rewardFilter,
    listingTypeFilter
  };
  const updateLocation = (value: string) => {
    setLocationFilter(value);
    if (value.trim()) setLocationStatus("Location set for this search.");
  };
  const updateDistance = (miles: number) => {
    setDistanceFilter(miles);
  };
  const useGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("GPS is not available in this browser.");
      return;
    }
    setLocationStatus("Finding nearest city...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const city = findNearestKnownCity(position.coords.latitude, position.coords.longitude);
        setLocationFilter(city.label);
        setLocationStatus(`Using nearest known city: ${city.label}.`);
      },
      () => setLocationStatus("Location permission was blocked or unavailable."),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };
  const clearSearch = () => {
    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = null;
    setOrganizationQuery("");
    setCategoryFilter("All");
    setLocationFilter(profile.launchCommunity);
    setDistanceFilter(profile.radiusMiles);
    setRewardFilter("all");
    setListingTypeFilter("all");
    setAppliedFilters(null);
    setHasSearched(false);
    setIsSearching(false);
    setLocationStatus("");
  };
  const searchIsDirty =
    Boolean(organizationQuery.trim()) ||
    categoryFilter !== "All" ||
    locationFilter !== profile.launchCommunity ||
    distanceFilter !== profile.radiusMiles ||
    rewardFilter !== "all" ||
    listingTypeFilter !== "all" ||
    hasSearched ||
    isSearching ||
    Boolean(locationStatus);
  const filterRecommendations = (filters: SearchFilters) => recommendations.filter((recommendation) => {
    const organizer = organizerForAction(recommendation.action, organizerProfiles);
    const cleanAppliedQuery = filters.organizationQuery.trim().toLowerCase();
    const matchesQuery =
      !cleanAppliedQuery ||
      [recommendation.action.organizer, recommendation.action.title, organizer?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(cleanAppliedQuery));
    const matchesCategory = filters.categoryFilter === "All" || recommendation.action.category === filters.categoryFilter;
    const matchesDistance = recommendation.action.distanceMiles <= filters.distanceFilter;
    const matchesReward =
      filters.rewardFilter === "all" ||
      (filters.rewardFilter === "rewards" && recommendation.action.rewardEligible) ||
      (filters.rewardFilter === "awareness" && !recommendation.action.rewardEligible);
    const matchesListingType = filters.listingTypeFilter === "all" || recommendation.action.listingType === filters.listingTypeFilter;
    return matchesQuery && matchesCategory && matchesDistance && matchesReward && matchesListingType;
  });
  const runSearch = () => {
    if (isSearching) return;
    const nextFilters = currentFilters;
    const nextRecommendations = filterRecommendations(nextFilters);
    setIsSearching(true);
    if (searchTimerRef.current !== null) window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(() => {
      setAppliedFilters(nextFilters);
      setHasSearched(true);
      setIsSearching(false);
      searchTimerRef.current = null;
      if (nextRecommendations.length && !nextRecommendations.some((recommendation) => recommendation.action.id === selectedId)) {
        onSelect(nextRecommendations[0].action.id);
      }
    }, SEARCH_FEEDBACK_DELAY_MS);
  };
  const displayedRecommendations = hasSearched && !isSearching && appliedFilters ? filterRecommendations(appliedFilters) : [];
  const activeRecommendation =
    displayedRecommendations.find((recommendation) => recommendation.action.id === selectedId) ?? displayedRecommendations[0];
  const activeOrganizer = activeRecommendation ? organizerForAction(activeRecommendation.action, organizerProfiles) : undefined;
  const activeOrganizerSaved = activeOrganizer ? activeOrganizer.savedByViewer || savedOrganizerIds.includes(activeOrganizer.id) : false;
  const matchedOrganizers = organizerProfiles.filter((organizer) =>
    organizer.name.toLowerCase().includes(cleanQuery || " ")
  );
  const resultStats = [
    { label: "Useful leads", value: String(displayedRecommendations.length), icon: statIcon.useful },
    {
      label: "Within reach",
      value: String(
        displayedRecommendations.filter((recommendation) => recommendation.action.distanceMiles <= (appliedFilters?.distanceFilter ?? profile.radiusMiles)).length
      ),
      icon: statIcon.radius
    },
    {
      label: "Trusted Enablers",
      value: String(displayedRecommendations.filter((recommendation) => recommendation.action.trustTier === "Verified" || recommendation.action.trustTier === "Anchor partner").length),
      icon: statIcon.verified
    }
  ];
  const recommendedBecauseFollowed = displayedRecommendations.filter((recommendation) => {
    const organizer = organizerForAction(recommendation.action, organizerProfiles);
    return Boolean(organizer?.id && savedOrganizerIds.includes(organizer.id));
  });

  return (
    <>
      <div className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Reach</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal sm:text-4xl">What can your hands change this week?</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(170px,1fr)_minmax(220px,1.15fr)_minmax(120px,0.7fr)_minmax(140px,0.8fr)_minmax(130px,0.75fr)_minmax(130px,0.75fr)]">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
            World Enabler / Event
            <input
              value={organizationQuery}
              onChange={(event) => setOrganizationQuery(event.target.value)}
              placeholder="World Enabler or event"
              className="min-h-10 rounded-md border border-tide/60 bg-paper px-2 text-sm font-semibold normal-case tracking-normal text-ink outline-none placeholder:text-ink/40 focus:border-tide"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
            Location
            <div className="flex min-w-0 gap-2">
              <input
                list="handprint-known-cities"
                value={locationFilter}
                onChange={(event) => updateLocation(event.target.value)}
                placeholder="City, ST or city, country"
                className="min-h-10 min-w-0 flex-1 rounded-md border border-tide/60 bg-paper px-2 text-sm font-semibold normal-case tracking-normal text-ink outline-none placeholder:text-ink/40 focus:border-tide"
              />
              <button
                type="button"
                onClick={useGpsLocation}
                className="search-filter-fill inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md border border-tide/60 px-2 text-xs font-semibold normal-case tracking-normal text-ink"
              >
                <MapPinned size={15} />
                GPS
              </button>
            </div>
            <datalist id="handprint-known-cities">
              {knownCities.map((city) => (
                <option key={city.label} value={city.label} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
            Distance
            <select
              value={distanceFilter}
              onChange={(event) => updateDistance(Number(event.target.value))}
              className="search-filter-fill min-h-10 rounded-md border border-tide/60 px-2 text-xs font-semibold normal-case tracking-normal text-ink outline-none focus:border-tide"
            >
              {[10, 25, 50, 100, 150].map((miles) => (
                <option key={miles} value={miles}>
                  Within {miles} mi
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
            Cause
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as EventCategory | "All")}
              className="search-filter-fill min-h-10 rounded-md border border-tide/60 px-2 text-xs font-semibold normal-case tracking-normal text-ink outline-none focus:border-tide"
            >
              <option>All</option>
              {allCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
            Rewards
            <select
              value={rewardFilter}
              onChange={(event) => setRewardFilter(event.target.value as "all" | "rewards" | "awareness")}
              className="search-filter-fill min-h-10 rounded-md border border-tide/60 px-2 text-xs font-semibold normal-case tracking-normal text-ink outline-none focus:border-tide"
            >
              <option value="all">All</option>
              <option value="rewards">Earns rewards</option>
              <option value="awareness">Awareness only</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
            Type
            <select
              value={listingTypeFilter}
              onChange={(event) => setListingTypeFilter(event.target.value as LocalAction["listingType"] | "all")}
              className="search-filter-fill min-h-10 rounded-md border border-tide/60 px-2 text-xs font-semibold normal-case tracking-normal text-ink outline-none focus:border-tide"
            >
              <option value="all">All</option>
              {["action", "awareness", "sponsored", "training", "fundraiser"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45 md:col-span-2 xl:col-span-3 2xl:col-span-1">
            Search
            <div className="grid grid-cols-[1fr_0.78fr] gap-2">
              <button
                type="button"
                data-testid="reach-search-button"
                onClick={runSearch}
                disabled={isSearching}
                className={`min-h-10 rounded-md px-3 text-xs font-semibold normal-case tracking-normal text-white transition ${
                  isSearching ? "search-pulse cursor-wait" : "bg-moss hover:brightness-110"
                }`}
              >
                {isSearching ? "Searching" : "Search"}
              </button>
              <button
                type="button"
                data-testid="reach-clear-button"
                onClick={clearSearch}
                disabled={!searchIsDirty}
                className={`min-h-10 rounded-md border px-2 text-xs font-semibold normal-case tracking-normal transition ${
                  searchIsDirty
                    ? "border-white/10 bg-white/10 text-paper/72 hover:bg-white/20"
                    : "cursor-not-allowed border-white/10 bg-transparent text-paper/25"
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        {locationStatus && <p role="status" aria-live="polite" className="mt-2 text-xs font-semibold text-ink/52">{locationStatus}</p>}
        {organizerLoadState === "loading" && (
          <p className="mt-2 text-xs font-semibold text-ink/50">Loading World Enabler handprints...</p>
        )}
        {organizerLoadState === "error" && (
          <p className="mt-2 text-xs font-semibold text-coral">World Enabler search is using local seed data until the ledger reconnects.</p>
        )}
        {cleanQuery && (
          <div className="mt-3 flex flex-wrap gap-2">
            {matchedOrganizers.slice(0, 4).map((organizer) => (
              <a
                key={organizer.id}
                href={runtimePath(`/organizations/${organizer.handle}`)}
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink/70"
              >
                <ShieldCheck size={13} className="text-moss" />
                {organizer.name}
              </a>
            ))}
            {!matchedOrganizers.length && (
              <span className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink/55">
                No World Enabler handprint matches yet
              </span>
            )}
          </div>
        )}
      </div>

      <div
        aria-busy={isSearching}
        className={`mt-5 grid gap-5 ${activeRecommendation ? "xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]" : ""}`}
      >
        <div className="grid content-start gap-3">
          {hasSearched && !isSearching && <StatsGrid stats={resultStats} className="mb-2" />}
          {recommendedBecauseFollowed.length > 0 && (
            <div className="rounded-lg border border-gold/25 bg-gold/10 p-4 text-sm font-semibold text-paper/72">
              {recommendedBecauseFollowed.length} result{recommendedBecauseFollowed.length === 1 ? "" : "s"} recommended because you follow the World Enabler.
            </div>
          )}
          {isSearching && (
            <div role="status" aria-live="polite" className="rounded-lg border border-tide/30 bg-tide/10 p-5 text-sm font-semibold text-paper/70">
              Searching for actions within your reach...
            </div>
          )}
          {!hasSearched && !isSearching && (
            <FirstMarkEmptyState
              location={locationFilter}
              distance={distanceFilter}
              onSearch={runSearch}
              recommendedAction={recommendations.find((recommendation) => recommendation.action.status === "approved" && recommendation.action.rewardEligible)?.action}
            />
          )}
          {displayedRecommendations.map((recommendation) => (
            <ActionCard
              key={recommendation.action.id}
              recommendation={recommendation}
              organizer={organizerForAction(recommendation.action, organizerProfiles)}
              organizerSaved={Boolean(organizerForAction(recommendation.action, organizerProfiles)?.id && savedOrganizerIds.includes(organizerForAction(recommendation.action, organizerProfiles)!.id))}
              selected={selectedId === recommendation.action.id}
              rsvpStatus={rsvps[recommendation.action.id]}
              onSelect={() => onSelect(recommendation.action.id)}
              onRsvp={() => onRsvp(recommendation.action)}
              onToggleOrganizerSave={() => {
                const organizer = organizerForAction(recommendation.action, organizerProfiles);
                if (organizer) onToggleOrganizerSave(organizer);
              }}
            />
          ))}
          {hasSearched && !isSearching && !displayedRecommendations.length && (
            <div className="rounded-lg border border-ink/10 bg-white p-5 text-sm font-semibold text-ink/62">
              No matching World Enabler or action yet. Try a broader cause, World Enabler name, or neighborhood.
            </div>
          )}
        </div>
        {activeRecommendation && (
          <div className="grid content-start gap-5 xl:sticky xl:top-24">
            <EventDetail
              recommendation={activeRecommendation}
              organizer={organizerForAction(activeRecommendation.action, organizerProfiles)}
              organizerSaved={activeOrganizerSaved}
              rsvpStatus={rsvps[activeRecommendation.action.id]}
              onRsvp={() => onRsvp(activeRecommendation.action)}
              onCheckIn={() => onCheckIn(activeRecommendation.action)}
              onNotInterested={onNotInterested}
              onToggleOrganizerSave={() => onToggleOrganizerSave(activeOrganizer)}
              hidden={selectedHidden}
            />
          </div>
        )}
      </div>
    </>
  );
}

function FirstMarkEmptyState({
  location,
  distance,
  recommendedAction,
  onSearch
}: {
  location: string;
  distance: number;
  recommendedAction?: LocalAction;
  onSearch: () => void;
}) {
  return (
    <section className="rounded-lg border border-dashed border-tide/30 bg-tide/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tide">Start with one useful action</p>
          <h3 className="mt-2 text-2xl font-semibold text-paper">Find a first mark near {location || "you"}.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/68">
            The simplest Handprint story is: choose one concrete thing, show up, get confirmed, and let that useful action become visible enough to invite someone else.
          </p>
        </div>
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <Radar size={17} />
          Search {distance} mi
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Find", "Search nearby action."],
          ["Show up", "Do the concrete task."],
          ["Confirm", "A World Enabler verifies it."],
          ["Share", "Your Handprint grows."]
        ].map(([label, copy]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/7 p-3">
            <p className="text-sm font-semibold text-paper">{label}</p>
            <p className="mt-1 text-xs leading-5 text-paper/58">{copy}</p>
          </div>
        ))}
      </div>
      {recommendedAction && (
        <p className="mt-4 text-xs font-semibold text-paper/58">
          Good first official mark to look for: <span className="text-paper">{recommendedAction.title}</span>
        </p>
      )}
    </section>
  );
}

function ActionCard({
  recommendation,
  organizer,
  organizerSaved,
  selected,
  rsvpStatus,
  onSelect,
  onRsvp,
  onToggleOrganizerSave
}: {
  recommendation: Recommendation;
  organizer?: OrganizerImpactProfile;
  organizerSaved: boolean;
  selected: boolean;
  rsvpStatus?: RsvpStatus;
  onSelect: () => void;
  onRsvp: () => void;
  onToggleOrganizerSave: () => void;
}) {
  const { action, score, reasons } = recommendation;
  const Icon = categoryIcon[action.category];
  const spotsLeft = action.capacity - action.attending - (rsvpStatus ? 1 : 0);
  const isPublic = action.status === "approved";
  const canEarn = action.rewardEligible;
  const categoryColor = categoryColors[action.category] ?? action.accent;
  const cardStyle: CSSProperties = {
    background: `linear-gradient(90deg, ${categoryColor} 0 7px, rgba(15, 23, 20, 0.92) 7px)`,
    borderColor: selected ? categoryColor : `${categoryColor}66`,
    boxShadow: selected ? `0 0 0 2px ${categoryColor}33` : undefined
  };

  return (
    <article
      style={cardStyle}
      className="rounded-lg border p-4 shadow-sm transition hover:brightness-110"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${categoryColor}24`, color: categoryColor }}>
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold leading-tight">{action.title}</h3>
                <StatusBadge status={action.status} trustTier={action.trustTier} />
                <ListingBadge action={action} />
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${actionOfficialTone(action)}`}>{actionOfficialLabel(action)}</span>
              </div>
              <p className="text-sm text-ink/60">{action.organizer}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/72">{action.summary}</p>
          <ReasonList reasons={reasons} />
          <div className="mt-3 flex flex-wrap gap-2">
            {canEarn ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/12 px-2.5 py-1 text-xs font-semibold text-ink">
                  <Trophy size={13} />
                  {action.reward.basePoints} pts
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-tide/10 px-2.5 py-1 text-xs font-semibold text-tide">
                  <Heart size={13} />
                  +{action.reward.appreciationCredits} credits
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink/7 px-2.5 py-1 text-xs font-semibold text-ink/62">
                <EyeOff size={13} />
                Awareness only
              </span>
            )}
            {canEarn && action.reward.badgeId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral">
                <Award size={13} />
                badge eligible
              </span>
            )}
          </div>
        </button>

        <div className="grid min-w-[164px] gap-2 md:justify-items-end">
          <ScoreMeter score={score} />
          <button
            type="button"
            onClick={onToggleOrganizerSave}
            disabled={!organizer}
            className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold transition ${
              organizerSaved
                ? "bg-moss text-white"
                : organizer
                  ? "border border-white/10 bg-white/10 text-paper/72 hover:bg-white/20"
                  : "cursor-not-allowed border border-white/10 bg-transparent text-paper/25"
            }`}
          >
            <Heart size={14} />
            {organizerSaved ? "Following" : "Follow Enabler"}
          </button>
          <p className="text-sm font-semibold">{action.startsAt}</p>
          <p className="text-xs text-ink/60">
            {action.neighborhood} · {action.distanceMiles} mi
          </p>
          <p className="text-xs text-ink/60">{Math.max(0, spotsLeft)} spots left</p>
          <button type="button"
            onClick={onRsvp}
            disabled={!isPublic}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold ${
              !isPublic
                ? "cursor-not-allowed bg-ink/10 text-ink/45"
                : rsvpStatus
                  ? "bg-moss text-white"
                  : "bg-ink text-paper"
            }`}
          >
            {rsvpStatus ? <CheckCircle2 size={17} /> : <Plus size={17} />}
            {rsvpStatus ? labelRsvp(rsvpStatus) : isPublic ? "RSVP" : "Reviewing"}
          </button>
        </div>
      </div>
    </article>
  );
}

function StoryPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/7 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/42">{label}</p>
      <p className="mt-1 text-xs leading-5 text-ink/68">{value}</p>
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const width = `${Math.max(6, Math.min(100, score))}%`;
  return (
    <div className="w-full min-w-32">
      <div className="flex justify-between text-xs font-semibold text-ink/55">
        <span>Fit</span>
        <span>{score}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-ink/8">
        <div className="h-2 rounded-full bg-tide" style={{ width }} />
      </div>
    </div>
  );
}

function EventDetail({
  recommendation,
  organizer,
  organizerSaved,
  rsvpStatus,
  onRsvp,
  onCheckIn,
  onNotInterested,
  onToggleOrganizerSave,
  hidden
}: {
  recommendation: Recommendation;
  organizer?: OrganizerImpactProfile;
  organizerSaved: boolean;
  rsvpStatus?: RsvpStatus;
  onRsvp: () => void;
  onCheckIn: () => void;
  onNotInterested: () => void;
  onToggleOrganizerSave: () => void;
  hidden: boolean;
}) {
  const { action, reasons } = recommendation;
  const isApproved = action.status === "approved";
  const isPromotional = action.listingType === "awareness" || action.listingType === "sponsored";
  const relatedWorldChangers = suggestedWorldChangers.filter(
    (person) => person.recruiting.some((item) => item.toLowerCase().includes(action.category.toLowerCase().split(" ")[0])) || person.following.includes(action.organizer)
  );
  const detailFollowerCount = organizer ? Math.max(1, Math.round(organizer.confirmedParticipants / 18)) : 0;
  const detailRecruitCount = Math.max(0, Math.round(action.attending / 3));
  const detailAffirmationCount = action.rewardEligible ? Math.max(2, Math.round(action.attending / 2)) : Math.max(0, Math.round(action.attending / 5));
  return (
    <section className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral">Selected action</p>
          <h2 data-testid="selected-action-title" className="mt-1 text-xl font-semibold">
            {action.title}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={action.status} trustTier={action.trustTier} />
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${actionOfficialTone(action)}`}>{actionOfficialLabel(action)}</span>
        </div>
      </div>
      {hidden && (
        <div className="mt-3 rounded-md border border-ink/10 bg-paper p-3 text-sm font-semibold text-ink/62">
          Marked not interested. Future feed logic should down-rank this type for you.
        </div>
      )}

      <div className="mt-4 grid gap-3 text-sm text-ink/72">
        <p>{action.summary}</p>
        <div className="grid gap-2">
          <StoryPoint label="Why it matters" value={action.impact} />
          <StoryPoint label="What you will actually do" value={actionTaskSummary(action)} />
          <StoryPoint label="Who benefits" value={action.beneficiary} />
          <StoryPoint label="What happens after" value={actionAfterSummary(action)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Metric label="followers" value={String(detailFollowerCount)} />
          <Metric label="recruits" value={String(detailRecruitCount)} />
          <Metric label="affirmations" value={String(detailAffirmationCount)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Info label="When" value={`${action.startsAt}, ${action.duration}`} />
          <Info label="Where" value={action.neighborhood} />
          <Info label="Impact" value={action.impact} />
          <Info label="World Enabler" value={action.organizer} />
          <Info label="Beneficiary" value={action.beneficiary} />
          <Info label="Confirmation" value={confirmationLabel(action.confirmationStatus)} />
          {action.sourceName && <Info label="Source" value={action.sourceName} />}
        </div>
      </div>

      {action.unofficialListing && (
        <div className="mt-4 rounded-md border border-tide/25 bg-tide/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-tide">Unofficial example</p>
          <p className="mt-1 text-sm leading-6 text-ink/72">
            {action.realWorldStatus} Handprint would need World Enabler registration and confirmation before rewards became official.
          </p>
          {action.sourceUrl && (
            <a href={action.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-tide">
              View public source
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      )}

      {organizer && (
        <div className="mt-4 rounded-md border border-moss/25 bg-moss/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">World Enabler Handprint</p>
              <p className="mt-1 font-semibold">{organizer.name}</p>
              <p className="mt-1 text-sm leading-6 text-ink/70">{organizer.publicSummary}</p>
            </div>
            <button type="button"
              onClick={onToggleOrganizerSave}
              className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                organizerSaved ? "bg-moss text-white" : "border border-ink/12 bg-white"
              }`}
            >
              <Heart size={15} />
              {organizerSaved ? "Following" : "Follow"}
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <a href={runtimePath(`/organizations/${organizer.handle}`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
              World Enabler page
              <ExternalLink size={15} />
            </a>
            <a href={runtimePath(`/organizations/${organizer.handle}/grant-report`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold">
              Grant preview
              <ClipboardCheck size={15} />
            </a>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-md border border-ink/10 bg-paper p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Safety note</p>
        <p className="mt-1 text-sm text-ink/72">{action.safetyNote}</p>
      </div>

      <div className="mt-4 rounded-md border border-tide/25 bg-tide/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-tide">Related World Changers</p>
        {relatedWorldChangers.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {relatedWorldChangers.slice(0, 3).map((person) => (
              <a key={person.handle} href={runtimePath(`/u/${person.handle}`)} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink/65">
                {person.name} · {person.tier}
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-ink/62">Related World Changers will appear as follow and recruiting data grows.</p>
        )}
      </div>

      <div className="mt-4 rounded-md border border-gold/30 bg-gold/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">World Changer reward</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold">
            <Trophy size={13} />
            {action.reward.basePoints} pts
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/72">{action.rewardReason}</p>
        {action.rewardEligible ? (
          <p className="mt-2 text-sm text-ink/72">
            World Enabler confirmation can add {action.reward.organizerConfirmedBonus} bonus points and unlock the event badge.
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink/72">
            This can still be shown to people who care about the cause, but rewards require a separate approved action bridge.
          </p>
        )}
        {action.actionBridge && <p className="mt-2 text-sm font-semibold text-tide">{action.actionBridge}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {action.reward.rubric.map((item) => (
            <span key={item} className="rounded-full border border-ink/10 bg-white px-2.5 py-1 text-xs font-semibold text-ink/65">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold">Why this matches</p>
        <ReasonList reasons={reasons} />
      </div>

      <div className="mt-4 rounded-md border border-ink/10 bg-paper p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Verification plan</p>
        <p className="mt-1 text-sm text-ink/72">{action.verificationPlan}</p>
        <p className="mt-2 text-xs font-semibold text-ink/55">{action.antiGamingNote}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button"
          data-testid="selected-action-join"
          onClick={onRsvp}
          disabled={!isApproved}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 font-semibold ${
            isApproved ? "bg-ink text-paper" : "cursor-not-allowed bg-ink/10 text-ink/45"
          }`}
        >
          {rsvpStatus ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
          {rsvpStatus ? labelRsvp(rsvpStatus) : "Join"}
        </button>
        <button type="button"
          data-testid="selected-action-checkin"
          onClick={onCheckIn}
          disabled={!isApproved || !rsvpStatus}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 font-semibold ${
            isApproved && rsvpStatus ? "bg-tide text-white" : "cursor-not-allowed bg-ink/10 text-ink/45"
          }`}
        >
          <UserCheck size={18} />
          Check in
        </button>
      </div>
      {isPromotional && (
        <button type="button"
          onClick={onNotInterested}
          className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-4 text-sm font-semibold"
        >
          <EyeOff size={16} />
          Not interested
        </button>
      )}
    </section>
  );
}

function ReachView({
  marks,
  rsvps,
  actions,
  progress,
  badges
}: {
  marks: HandprintMark[];
  rsvps: RsvpMap;
  actions: LocalAction[];
  progress: ReturnType<typeof worldChangerProgress>;
  badges: RewardBadge[];
}) {
  const going = Object.values(rsvps).filter((status) => status === "going").length;
  const checkedIn = Object.values(rsvps).filter((status) => status === "checked_in" || status === "confirmed").length;

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">Your Handprint</p>
            <h2 className="mt-1 text-3xl font-semibold">What your hands have changed</h2>
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
            <Trophy size={18} className="text-gold" />
            {progress.currentTier.name}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="World Changer points" value={String(progress.points)} />
          <Metric label="RSVPs active" value={String(going)} />
          <Metric label="Checked in" value={String(checkedIn)} />
          <Metric label="Badges earned" value={String(badges.length)} />
        </div>

        <div className="mt-4 rounded-lg border border-gold/30 bg-gold/10 p-4">
          <div className="flex justify-between text-sm font-semibold">
            <span>{progress.currentTier.name}</span>
            <span>{progress.nextTier ? progress.nextTier.name : "Top tier"}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white">
            <div className="h-3 rounded-full bg-gold" style={{ width: `${progress.progressToNext}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink/68">
            {progress.nextTier
              ? `${progress.nextTier.minPoints - progress.points} more points to unlock ${progress.nextTier.name}.`
              : "World Changer tier unlocked."}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Award className="text-gold" />
            <h3 className="text-xl font-semibold">Badge wall</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Badges are visible by default because they help invite others into useful action. Hiding one should stay available, but quiet.
          </p>
          <div className="mt-4 grid gap-3">
            {badges.map((badge) => (
              <div key={badge.id} className="rounded-md border border-ink/10 bg-paper p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{badge.title}</p>
                    <p className="mt-1 text-sm leading-6 text-ink/66">{badge.description}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: badge.accent }}>
                    {badge.category}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-ink/55">
                  {badge.verification} · {badge.issuedBy}
                </p>
                <a href={runtimePath(`/badges/${badge.id}`)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tide">
                  Achievement page
                  <ArrowRight size={15} />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Gift className="text-coral" />
            <h3 className="text-xl font-semibold">Reach rewards</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink/66">
            Real-world rewards should expand what a World Changer can do next. Pilot rewards can be limited or paused by funding, sponsor, age group, or local market.
          </p>
          <div className="mt-4 grid gap-3">
            {reachRewards.filter((reward) => !reward.title.includes("Scholarship")).map((reward) => (
              <ReachRewardCard key={reward.id} reward={reward} progress={progress} />
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-tide/25 bg-tide/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-tide">College scholarship ladder</p>
            <p className="mt-1 text-sm leading-6 text-ink/66">
              Scholarship rewards are modeled as capacity-building awards with review controls, funding gates, and verified-impact requirements.
            </p>
            <div className="mt-3 grid gap-2">
              {reachRewards
                .filter((reward) => reward.title.includes("Scholarship"))
                .map((reward, index) => (
                  <div key={reward.id} className="grid gap-2 rounded-md border border-white/10 bg-white/55 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-semibold text-paper">{index + 1}</span>
                    <div>
                      <p className="font-semibold">{reward.title}</p>
                      <p className="text-xs leading-5 text-ink/58">{reward.description}</p>
                    </div>
                    <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-ink/62">{reward.pointsRequired} pts</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-tide" />
            <h3 className="text-xl font-semibold">Training credentials</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {trainingCredentials.map((credential) => (
              <div key={credential.id} className="rounded-md border border-ink/10 bg-white p-3">
                <p className="font-semibold">{credential.title}</p>
                <p className="mt-1 text-sm text-ink/62">
                  {credential.provider} · {credential.confidence}
                </p>
                <p className="mt-2 text-xs font-semibold text-tide">{credential.leadershipUnlock}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-paper px-2.5 text-xs font-semibold text-ink/64">
                    <Upload size={13} />
                    {credential.uploadState.replaceAll("_", " ")}
                  </span>
                  <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-moss/10 px-2.5 text-xs font-semibold text-moss">
                    <BadgeCheck size={13} />
                    {credential.evidenceLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft xl:col-span-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-coral" />
            <h3 className="text-xl font-semibold">Participation trail</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {marks.slice().reverse().map((mark) => {
              const action = actions.find((item) => item.id === mark.eventId);
              return (
                <div key={mark.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <p className="font-semibold">{mark.label}</p>
                  <p className="mt-1 text-sm text-ink/62">
                    {displayMarkSource(mark.source)} · {action?.organizer ?? "World Enabler"} · {mark.points} pts
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReachRewardCard({ reward, progress }: { reward: ReachReward; progress: ReturnType<typeof worldChangerProgress> }) {
  const unlocked = progress.points >= reward.pointsRequired;
  const status = reward.availability.replaceAll("_", " ");

  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{reward.category}</p>
          <h4 className="mt-1 text-lg font-semibold">{reward.title}</h4>
          <p className="mt-1 text-sm leading-6 text-ink/66">{reward.description}</p>
        </div>
        <span
          className="inline-flex min-h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold text-white"
          style={{ backgroundColor: reward.accent }}
        >
          {status}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-ink/66 sm:grid-cols-3">
        <div className="rounded-md bg-white p-3">
          <p className="font-semibold text-ink">{reward.milestone}</p>
          <p className="text-xs">milestone</p>
        </div>
        <div className="rounded-md bg-white p-3">
          <p className="font-semibold text-ink">{reward.pointsRequired} pts</p>
          <p className="text-xs">{unlocked ? "eligible for review" : "eligibility target"}</p>
        </div>
        <div className="rounded-md bg-white p-3">
          <p className="font-semibold text-ink">{reward.sponsor}</p>
          <p className="text-xs">sponsor/funder</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-ink/58">{reward.stewardshipNote}</p>
      <p className="mt-1 text-xs leading-5 text-ink/50">{reward.control}</p>
    </div>
  );
}

function FollowingOrganizationsView({
  organizerProfiles,
  savedOrganizerIds,
  followedWorldChangerHandles,
  onToggleOrganizerSave,
  onToggleWorldChangerFollow
}: {
  organizerProfiles: OrganizerImpactProfile[];
  savedOrganizerIds: string[];
  followedWorldChangerHandles: string[];
  onToggleOrganizerSave: (organizer: OrganizerImpactProfile) => void;
  onToggleWorldChangerFollow: (handle: string) => void;
}) {
  const followed = organizerProfiles.filter((organizer) => savedOrganizerIds.includes(organizer.id));
  const followedWorldChangers = suggestedWorldChangers.filter((person) => followedWorldChangerHandles.includes(person.handle));
  const discoverableWorldChangers = suggestedWorldChangers.filter((person) => !followedWorldChangerHandles.includes(person.handle));
  const feedItems = [
    ...followed.flatMap((organizer) => [
      {
        id: `${organizer.id}-receipt`,
        eyebrow: "World Enabler update",
        title: `${organizer.name} posted ${organizer.impactReceiptIds.length} impact receipts`,
        detail: organizer.publicSummary,
        href: `/organizations/${organizer.handle}`
      },
      {
        id: `${organizer.id}-grant`,
        eyebrow: "Grant-ready proof",
        title: `${organizer.confirmedParticipants} confirmed participants and ${organizer.volunteerHours} hours`,
        detail: organizer.grantReadySummary,
        href: `/organizations/${organizer.handle}/grant-report`
      }
    ]),
    ...followedWorldChangers.map((person) => ({
      id: `${person.handle}-recruiting`,
      eyebrow: "World Changer recruiting",
      title: `${person.name} is recruiting for ${person.recruiting[0]}`,
      detail: `Also following ${person.following.join(", ")}.`,
      href: `/u/${person.handle}`
    }))
  ];

  return (
    <section className="grid gap-5">
      <ShakeNetworkHero />

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="World Enablers followed" value={String(followed.length)} />
        <Metric label="World Changers followed" value={String(followedWorldChangers.length)} />
        <Metric label="Feed updates" value={String(feedItems.length)} />
        <Metric label="Recruiting paths" value={String(followedWorldChangers.reduce((sum, person) => sum + person.recruiting.length, 0))} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Radar className="text-gold" />
          <h3 className="text-xl font-semibold">People and groups from your Shakes</h3>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {feedItems.length ? (
            feedItems.slice(0, 6).map((item) => (
              <a key={item.id} href={runtimePath(item.href)} className="rounded-md border border-ink/10 bg-paper p-4 transition hover:border-tide">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{item.eyebrow}</p>
                <p className="mt-1 font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink/64">{item.detail}</p>
              </a>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-ink/12 bg-paper p-4 text-sm font-semibold text-ink/50 xl:col-span-2">
              Follow World Enablers or World Changers to build a live discovery feed.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <UserCheck className="text-tide" />
          <h3 className="text-xl font-semibold">World Changers you follow</h3>
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {followedWorldChangers.map((person) => (
            <WorldChangerFollowCard key={person.handle} person={person} followed onToggle={() => onToggleWorldChangerFollow(person.handle)} />
          ))}
          {discoverableWorldChangers.map((person) => (
            <WorldChangerFollowCard key={person.handle} person={person} followed={false} onToggle={() => onToggleWorldChangerFollow(person.handle)} />
          ))}
        </div>
      </div>

      {followed.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {followed.map((profile) => (
            <article key={profile.id} className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{profile.trustTier}</p>
                  <h3 className="mt-1 text-2xl font-semibold">{profile.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{profile.publicSummary}</p>
                </div>
                <button type="button"
                  onClick={() => onToggleOrganizerSave(profile)}
                  className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md bg-moss px-3 text-sm font-semibold text-white"
                >
                  <Heart size={15} />
                  Following
                </button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Metric label="confirmed" value={String(profile.confirmedParticipants)} />
                <Metric label="hours" value={String(profile.volunteerHours)} />
                <Metric label="receipts" value={String(profile.impactReceiptIds.length)} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a href={runtimePath(`/organizations/${profile.handle}`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
                  World Enabler page
                  <ExternalLink size={15} />
                </a>
                <a href={runtimePath(`/organizations/${profile.handle}/grant-report`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold">
                  Grant preview
                  <ClipboardCheck size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-ink/10 bg-white/108 p-6 shadow-soft">
          <p className="text-lg font-semibold">No followed World Enablers yet.</p>
          <p className="mt-2 text-sm leading-6 text-ink/66">
            Follow a host from an event card or event detail to build a personal list of World Enablers whose Handprints you want to watch.
          </p>
        </div>
      )}
    </section>
  );
}

function WorldChangerFollowCard({
  person,
  followed,
  onToggle
}: {
  person: FollowedWorldChanger;
  followed: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: person.accent }}>
            {person.tier} · {person.points} pts
          </p>
          <h4 className="mt-1 text-xl font-semibold">{person.name}</h4>
          <p className="mt-2 text-sm leading-6 text-ink/68">{person.focus}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold ${
            followed ? "bg-moss text-white" : "border border-white/10 bg-white/10 text-paper/72"
          }`}
        >
          <Heart size={14} />
          {followed ? "Following" : "Follow"}
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Recruiting</p>
          <p className="mt-1 text-sm leading-6 text-ink/68">{person.recruiting.join(", ")}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Following</p>
          <p className="mt-1 text-sm leading-6 text-ink/68">{person.following.join(", ")}</p>
        </div>
      </div>
      <a href={runtimePath(`/u/${person.handle}`)} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
        Open QR Handprint
        <ExternalLink size={15} />
      </a>
    </article>
  );
}

function ShareView({
  shareUrl,
  marks,
  actions,
  progress,
  badges,
  availableCredits,
  qrUrl,
  onSpendCredit,
  onCopy,
  copied
}: {
  shareUrl: string;
  marks: HandprintMark[];
  actions: LocalAction[];
  progress: ReturnType<typeof worldChangerProgress>;
  badges: RewardBadge[];
  availableCredits: number;
  qrUrl: string;
  onSpendCredit: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const [selectedSharePlatformId, setSelectedSharePlatformId] = useState(sharePlatforms[0].id);
  const [shareMessage, setShareMessage] = useState(defaultShareMessage);
  const [interactionMessage, setInteractionMessage] = useState("Thanks for making this useful action possible. I would like to help and invite a few neighbors who care about the same thing.");
  const [preparedShareCopied, setPreparedShareCopied] = useState(false);
  const [sharePreviewOpen, setSharePreviewOpen] = useState(false);
  const [shareActionStatus, setShareActionStatus] = useState("Draft not saved yet.");
  const [commentSort, setCommentSort] = useState<"newest" | "needs_review" | "ready">("newest");
  const [socialLoadState, setSocialLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [customShareTemplates, setCustomShareTemplates] = useState<ShareTemplate[]>([]);
  const [templateLabel, setTemplateLabel] = useState("My next invite");
  const [shareDrafts, setShareDrafts] = useState<ShareDraft[]>([]);
  const [shareHistory, setShareHistory] = useState<ShareHistoryItem[]>([]);
  const [moderationReviews, setModerationReviews] = useState<SocialModerationReview[]>([]);
  const [socialComments, setSocialComments] = useState<SocialComment[]>([]);
  const [socialMessages, setSocialMessages] = useState<SocialMessage[]>([]);
  const [socialReports, setSocialReports] = useState<SocialReport[]>([]);
  const [accountControls, setAccountControls] = useState<SocialAccountControl[]>([]);
  const [socialNotifications, setSocialNotifications] = useState<SocialNotification[]>([]);
  const [socialPreferences, setSocialPreferences] = useState<SocialPreferences>({
    notifyComments: true,
    notifyMessages: true,
    notifyReviews: true,
    notifyReports: true,
    quietMode: false,
    messageRequestPolicy: "followed_network",
    externalShareReviewRequired: true
  });
  const [selectedAchievementId, setSelectedAchievementId] = useState("");
  const [selectedActionId, setSelectedActionId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(shareTemplates[0].id);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(sharePlatforms[0].hashtags);
  const [messageMode, setMessageMode] = useState<"private_request" | "recruitment" | "event_update">("private_request");
  const [recipientId, setRecipientId] = useState("berkeley-county-meals-on-wheels");
  const allShareTemplates = [...shareTemplates, ...customShareTemplates];
  const activeSharePlatform = sharePlatforms.find((platform) => platform.id === selectedSharePlatformId) ?? sharePlatforms[0];
  const shareModeration = evaluateHandprintMessage(shareMessage);
  const interactionModeration = evaluateHandprintMessage(interactionMessage);
  const approvedShareMessage = shareModeration.status === "ready" ? shareMessage.trim() : shareModeration.suggestion;
  const externalShareUrl = buildExternalShareUrl(activeSharePlatform, qrUrl, approvedShareMessage);
  const completed = marks
    .map((mark) => ({ mark, action: actions.find((action) => action.id === mark.eventId) }))
    .filter(({ action }) => action);
  const nextActions = actions.filter((action) => action.status === "approved" && !marks.some((mark) => mark.eventId === action.id)).slice(0, 3);
  const latestCompleted = completed.at(-1);
  const selectedAchievement = completed.find(({ mark }) => mark.id === selectedAchievementId) ?? latestCompleted;
  const selectedAction = nextActions.find((action) => action.id === selectedActionId) ?? nextActions[0];
  const shareCharactersRemaining = activeSharePlatform.characterLimit - preparedShareTextLength(approvedShareMessage, selectedHashtags, qrUrl);
  const postStatus: SharePostStatus = shareHistory.some((item) => item.platformId === activeSharePlatform.id && item.status === "shared")
    ? "shared"
    : shareModeration.status === "ready"
      ? "ready"
      : shareModeration.status === "rewrite"
        ? "reviewed"
        : "draft";
  const sortedSocialComments = [...socialComments].sort((a, b) => {
    if (commentSort === "needs_review") return Number(b.status !== "sent") - Number(a.status !== "sent") || b.createdAt.localeCompare(a.createdAt);
    if (commentSort === "ready") return Number(b.status === "sent") - Number(a.status === "sent") || b.createdAt.localeCompare(a.createdAt);
    return b.createdAt.localeCompare(a.createdAt);
  });
  const hasMutedRecipient = accountControls.some((control) => control.targetId === recipientId && control.control === "muted");
  const hasBlockedRecipient = accountControls.some((control) => control.targetId === recipientId && control.control === "blocked");
  const preparedShareText = [
    approvedShareMessage,
    selectedAchievement?.mark ? `Latest mark: ${selectedAchievement.mark.label}` : "",
    selectedAction ? `Join next: ${selectedAction.title}` : "",
    selectedHashtags.join(" "),
    "",
    `${publicHandprintProfile.displayName}'s Handprint: ${qrUrl}`,
    `${progress.currentTier.name} - ${progress.points} World Changer points`
  ]
    .filter(Boolean)
    .join("\n");
  useEffect(() => {
    fetch("/api/social")
      .then((response) => (response.ok ? response.json() : null))
      .then((ledger: SocialLedger | null) => {
        if (ledger) {
          applySocialLedger(ledger);
          const platformDraft = ledger.drafts.find((draft) => draft.platformId === selectedSharePlatformId);
          if (platformDraft) {
            setShareMessage(platformDraft.message);
            setSelectedTemplateId(platformDraft.templateId ?? allShareTemplates[0].id);
            setSelectedAchievementId(platformDraft.selectedAchievementId ?? "");
            setSelectedActionId(platformDraft.selectedActionId ?? "");
            setSelectedHashtags(platformDraft.hashtags.length ? platformDraft.hashtags : activeSharePlatform.hashtags);
          }
        }
        setSocialLoadState("ready");
      })
      .catch(() => {
        setSocialError("Wave activity is unavailable; your current preview still works.");
        setSocialLoadState("error");
      });
  }, []);

  useEffect(() => {
    setSelectedHashtags(activeSharePlatform.hashtags);
  }, [activeSharePlatform.id]);

  const applySocialLedger = (ledger: SocialLedger) => {
    setCustomShareTemplates(ledger.templates);
    setShareDrafts(ledger.drafts);
    setShareHistory(ledger.history);
    setModerationReviews(ledger.moderationReviews);
    setSocialComments(ledger.comments);
    setSocialMessages(ledger.messages);
    setSocialReports(ledger.reports);
    setAccountControls(ledger.accountControls);
    setSocialNotifications(ledger.notifications);
    setSocialPreferences(ledger.preferences);
  };

  const postSocialPatch = async (body: Record<string, unknown>) => {
    setSocialSaving(true);
    setSocialError("");
    try {
      const response = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Social update failed");
      if (payload.ledger) applySocialLedger(payload.ledger);
      if (payload.review) setModerationReviews((current) => [payload.review, ...current.filter((review) => review.id !== payload.review.id)]);
      setShareActionStatus("Saved to your Wave activity.");
      return payload;
    } catch (error) {
      setSocialError(error instanceof Error ? error.message : "Social update failed");
      setShareActionStatus("Could not save this Wave update.");
      return null;
    } finally {
      setSocialSaving(false);
    }
  };

  const copyPreparedShare = async () => {
    await navigator.clipboard.writeText(preparedShareText);
    setShareHistory((current) => [
      {
        id: `optimistic-share-${Date.now()}`,
        userId: "local",
        platformId: activeSharePlatform.id,
        preparedText: preparedShareText,
        status: "shared",
        selectedAchievementId: selectedAchievement?.mark.id,
        selectedActionId: selectedAction?.id,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    void postSocialPatch({
      action: "record_share_history",
      platformId: activeSharePlatform.id,
      preparedText: preparedShareText,
      status: "shared",
      selectedAchievementId: selectedAchievement?.mark.id,
      selectedActionId: selectedAction?.id
    });
    setPreparedShareCopied(true);
    setShareActionStatus("Share kit copied and recorded.");
    window.setTimeout(() => setPreparedShareCopied(false), 1600);
  };
  const saveShareDraft = () =>
    postSocialPatch({
      action: "save_share_draft",
      platformId: activeSharePlatform.id,
      message: shareMessage,
      templateId: selectedTemplateId,
      selectedAchievementId: selectedAchievement?.mark.id,
      selectedActionId: selectedAction?.id,
      hashtags: selectedHashtags
    });
  const saveCustomTemplate = () =>
    postSocialPatch({
      action: "save_share_template",
      label: templateLabel,
      message: shareMessage,
      platformId: activeSharePlatform.id
    });
  const deleteCustomTemplate = (templateId: string) =>
    postSocialPatch({
      action: "delete_share_template",
      templateId
    });
  const updateSocialPreference = (patch: Partial<SocialPreferences>) =>
    postSocialPatch({
      action: "update_preferences",
      preferences: patch
    });
  const markSocialNotificationsRead = (notificationIds?: string[]) =>
    postSocialPatch({
      action: "mark_notifications_read",
      notificationIds
    });
  const loadShareDraft = (draft: ShareDraft) => {
    const draftPlatform = sharePlatforms.find((platform) => platform.id === draft.platformId) ?? sharePlatforms[0];
    setSelectedSharePlatformId(draft.platformId);
    setShareMessage(draft.message);
    setSelectedTemplateId(draft.templateId ?? allShareTemplates[0].id);
    setSelectedAchievementId(draft.selectedAchievementId ?? "");
    setSelectedActionId(draft.selectedActionId ?? "");
    setSelectedHashtags(draft.hashtags.length ? draft.hashtags : draftPlatform.hashtags);
    setShareActionStatus("Draft loaded for editing.");
  };
  const submitComment = () => {
    const targetId = selectedAchievement?.mark.badgeId ?? selectedAchievement?.mark.id ?? "public-profile-dan";
    const optimisticComment: SocialComment = {
      id: `optimistic-comment-${Date.now()}`,
      userId: "local",
      authorName: publicHandprintProfile.displayName,
      targetType: selectedAchievement?.mark.badgeId ? "achievement" : "public_profile",
      targetId,
      text: interactionMessage,
      approvedText: interactionModeration.status === "ready" ? interactionMessage : interactionModeration.suggestion,
      moderationReviewId: "pending",
      status: interactionModeration.status === "ready" ? "sent" : interactionModeration.status === "escalated" ? "escalated" : "rewrite_suggested",
      createdAt: new Date().toISOString()
    };
    setSocialComments((current) => [optimisticComment, ...current]);
    void postSocialPatch({
      action: "create_comment",
      targetType: optimisticComment.targetType,
      targetId,
      text: interactionMessage
    });
  };
  const submitMessage = () => {
    const optimisticMessage: SocialMessage = {
      id: `optimistic-message-${Date.now()}`,
      userId: "local",
      authorName: publicHandprintProfile.displayName,
      recipientType: messageMode === "private_request" ? "world_changer" : "world_enabler",
      recipientId,
      messageType: messageMode,
      text: interactionMessage,
      approvedText: interactionModeration.status === "ready" ? interactionMessage : interactionModeration.suggestion,
      moderationReviewId: "pending",
      status: interactionModeration.status === "ready" ? "sent" : interactionModeration.status === "escalated" ? "escalated" : "rewrite_suggested",
      createdAt: new Date().toISOString()
    };
    setSocialMessages((current) => [optimisticMessage, ...current]);
    void postSocialPatch({
      action: "create_message",
      recipientType: optimisticMessage.recipientType,
      recipientId,
      messageType: messageMode,
      text: interactionMessage
    });
  };
  const reportSocialContent = (contentType: "comment" | "message" | "share", contentId: string) => {
    setSocialReports((current) => [
      {
        id: `optimistic-report-${Date.now()}`,
        userId: "local",
        contentType,
        contentId,
        reason: "Tone or safety review",
        note: "Queued from Wave.",
        status: "queued",
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    void postSocialPatch({
      action: "report_content",
      contentType,
      contentId,
      reason: "Tone or safety review",
      note: "Queued from Wave."
    });
  };
  const setAccountControl = (control: AccountControlKind, enabled: boolean) =>
    postSocialPatch({
      action: "account_control",
      targetId: recipientId,
      control,
      enabled,
      note: `${control} from Wave`
    });

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Wave</p>
            <h2 className="mt-1 text-3xl font-semibold">Send your Handprint outward</h2>
            <p className="mt-2 max-w-2xl text-ink/70">
              This is the pride loop: a personal link that turns useful local action into something visible, credible, and easy for someone else to join.
            </p>
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
            <Trophy size={18} className="text-gold" />
            {progress.currentTier.name}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <HandprintVisual marks={marks} />
          <QrCodeCard
            title={`${publicHandprintProfile.displayName}'s Handprint`}
            publicUrl={qrUrl}
            fallbackUrl={qrUrl}
            tier={progress.currentTier.name}
            points={progress.points}
            enabled={publicQrState.enabled}
            rotatedAt={publicQrState.rotatedAt}
            designNote={publicQrState.designNote}
            compact
          />
          <div className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Share link</p>
            <p data-testid="share-url" className="mt-1 break-all text-sm font-semibold">
              {shareUrl}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={onCopy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
                <Copy size={17} />
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={runtimePath(publicHandprintProfile.sharePath)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold"
              >
                <ExternalLink size={17} />
                Open
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Gift className="text-coral" />
              <h3 className="text-lg font-semibold">Appreciation credits</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/66">
              Spend credits to affirm another person’s verified mark. Credits come from participation, not endless tapping.
            </p>
            <div className="mt-3 rounded-md bg-paper p-3">
              <p className="text-2xl font-semibold">{availableCredits}</p>
              <p className="text-xs text-ink/58">available to give</p>
            </div>
            <button type="button"
              onClick={onSpendCredit}
              disabled={availableCredits <= 0}
              className={`mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold ${
                availableCredits > 0 ? "bg-coral text-white" : "cursor-not-allowed bg-ink/10 text-ink/45"
              }`}
            >
              <Heart size={16} />
              Give one credit
            </button>
          </div>
        </div>

        <div className="grid min-w-0 gap-4">
          <div className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tide">Social share kit</p>
                <h3 className="mt-1 text-2xl font-semibold">Format your Handprint for the app you are posting to</h3>
                <p className="mt-2 text-sm leading-6 text-ink/66">
                  Pick a surface, add your message, and the Affirmation Agent will keep the post aligned with Handprint's mission before it leaves the app.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-moss/25 bg-moss/12 px-3 text-sm font-semibold text-moss">
                  <ShieldCheck size={16} />
                  AI review on
                </span>
                <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-tide/25 bg-tide/12 px-3 text-sm font-semibold text-tide">
                  <ClipboardCheck size={16} />
                  {postStatus}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {sharePlatforms.map((platform) => {
                const selected = platform.id === activeSharePlatform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedSharePlatformId(platform.id)}
                    className={`min-h-16 rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                      selected ? "bg-ink text-paper shadow-soft" : "border-ink/10 bg-paper text-ink/72 hover:border-tide/45"
                    }`}
                    style={selected ? { borderColor: platform.accent } : undefined}
                  >
                    <span className="block">{platform.label}</span>
                    <span className="block text-xs font-medium opacity-75">{platform.surface}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid min-w-0 gap-4 2xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
              <div className="rounded-lg border border-ink/10 bg-paper p-3">
                <div
                  className="mx-auto grid w-full max-w-[250px] place-items-center rounded-lg border p-4 text-center shadow-soft"
                  style={{
                    aspectRatio: activeSharePlatform.aspectRatio,
                    borderColor: activeSharePlatform.accent,
                    background: `linear-gradient(145deg, ${activeSharePlatform.accent}22, rgba(15, 23, 42, 0.92))`
                  }}
                >
                  <div className="grid gap-2 text-paper">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-white/25 bg-white/10">
                      <Hand size={30} />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">{activeSharePlatform.surface}</p>
                    <p className="text-2xl font-semibold">{publicHandprintProfile.displayName}'s Handprint</p>
                    <p className="text-sm opacity-80">
                      {progress.currentTier.name} · {progress.points} points · {badges.length} badges
                    </p>
                    {latestCompleted?.mark && <p className="text-xs leading-5 opacity-78">Latest mark: {latestCompleted.mark.label}</p>}
                  </div>
                </div>
                <div className="mt-3 rounded-md border border-ink/10 bg-white/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Prepared format</p>
                  <p className="mt-1 text-sm font-semibold">{activeSharePlatform.aspectRatio} · {activeSharePlatform.instruction}</p>
                  <div className="mt-3 grid gap-1">
                    {activeSharePlatform.renderNotes.map((note) => (
                      <p key={note} className="flex items-start gap-2 text-xs leading-5 text-ink/60">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-moss" />
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid min-w-0 gap-3">
                <div className="grid min-w-0 gap-2 md:grid-cols-3">
                  <label className="grid min-w-0 gap-1 text-sm font-semibold">
                    Template
                    <select
                      value={selectedTemplateId}
                      onChange={(event) => {
                        const template = allShareTemplates.find((item) => item.id === event.target.value) ?? allShareTemplates[0];
                        setSelectedTemplateId(template.id);
                        setShareMessage(template.message);
                      }}
                      className="min-h-10 w-full min-w-0 rounded-md border border-tide/40 bg-paper px-3 text-sm outline-none"
                    >
                      {allShareTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-1 text-sm font-semibold">
                    Achievement
                    <select
                      value={selectedAchievement?.mark.id ?? ""}
                      onChange={(event) => setSelectedAchievementId(event.target.value)}
                      className="min-h-10 w-full min-w-0 rounded-md border border-tide/40 bg-paper px-3 text-sm outline-none"
                    >
                      {completed.map(({ mark }) => (
                        <option key={mark.id} value={mark.id}>
                          {mark.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid min-w-0 gap-1 text-sm font-semibold">
                    Next action
                    <select
                      value={selectedAction?.id ?? ""}
                      onChange={(event) => setSelectedActionId(event.target.value)}
                      className="min-h-10 w-full min-w-0 rounded-md border border-tide/40 bg-paper px-3 text-sm outline-none"
                    >
                      {nextActions.map((action) => (
                        <option key={action.id} value={action.id}>
                          {action.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Post message</span>
                  <textarea
                    value={shareMessage}
                    onChange={(event) => setShareMessage(event.target.value)}
                    rows={4}
                    className="min-h-28 resize-y rounded-md border border-ink/10 bg-paper px-3 py-2 text-sm leading-6 outline-none transition focus:border-tide"
                    placeholder="Add an invitation or milestone message..."
                  />
                </label>

                <ModerationPanel
                  title="Posting standard"
                  moderation={shareModeration}
                  onUseSuggestion={() => setShareMessage(shareModeration.suggestion)}
                />

                <div className="rounded-lg border border-ink/10 bg-paper p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Platform fit</p>
                    <p className={`text-sm font-semibold ${shareCharactersRemaining < 0 ? "text-coral" : "text-moss"}`}>
                      {activeSharePlatform.characterLimit > 10000
                        ? "Within platform limit"
                        : `${Math.abs(shareCharactersRemaining)} characters ${shareCharactersRemaining < 0 ? "over" : "remaining"}`}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeSharePlatform.hashtags.map((hashtag) => {
                      const selected = selectedHashtags.includes(hashtag);
                      return (
                        <button
                          key={hashtag}
                          type="button"
                          onClick={() =>
                            setSelectedHashtags((current) =>
                              selected ? current.filter((item) => item !== hashtag) : Array.from(new Set([...current, hashtag]))
                            )
                          }
                          className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                            selected ? "border-moss bg-moss text-white" : "border-ink/12 bg-white/50 text-ink/62"
                          }`}
                        >
                          {hashtag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-ink/10 bg-paper p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="grid flex-1 gap-1 text-sm font-semibold">
                      Custom template name
                      <input
                        value={templateLabel}
                        onChange={(event) => setTemplateLabel(event.target.value)}
                        className="min-h-10 rounded-md border border-tide/40 bg-white/70 px-3 text-sm outline-none"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void saveCustomTemplate()}
                      disabled={socialSaving}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper disabled:cursor-wait disabled:opacity-60"
                    >
                      <ClipboardCheck size={16} />
                      Save template
                    </button>
                  </div>
                  {customShareTemplates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {customShareTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => void deleteCustomTemplate(template.id)}
                          className="rounded-md border border-coral/20 bg-coral/10 px-2.5 py-1.5 text-xs font-semibold text-coral"
                        >
                          Delete {template.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSharePreviewOpen(true)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gold/35 bg-gold/12 px-3 text-sm font-semibold text-gold sm:col-span-2"
                  >
                    <Sparkles size={17} />
                    Preview formatted post
                  </button>
                  <a
                    href={runtimePath(`/api/share-card?platform=${activeSharePlatform.id}&template=${selectedTemplateId}&format=png&message=${encodeURIComponent(approvedShareMessage)}`)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper"
                  >
                    <ExternalLink size={17} />
                    PNG card
                  </a>
                  <a
                    href={runtimePath(`/api/share-card?platform=${activeSharePlatform.id}&template=${selectedTemplateId}&format=svg&message=${encodeURIComponent(approvedShareMessage)}`)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/12 bg-paper px-3 text-sm font-semibold text-ink"
                  >
                    <ExternalLink size={17} />
                    SVG card
                  </a>
                  {externalShareUrl ? (
                    <a
                      href={externalShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-moss px-3 text-sm font-semibold text-white"
                    >
                      <Share2 size={17} />
                      Open {activeSharePlatform.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={copyPreparedShare}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-moss px-3 text-sm font-semibold text-white"
                    >
                      <Copy size={17} />
                      {preparedShareCopied ? "Copied kit" : "Copy share kit"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={copyPreparedShare}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/12 bg-paper px-3 text-sm font-semibold text-ink"
                  >
                    <Copy size={17} />
                    {preparedShareCopied ? "Copied" : "Copy approved text"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveShareDraft()}
                    disabled={socialSaving}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-tide/35 bg-tide/15 px-3 text-sm font-semibold text-tide disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
                  >
                    <ClipboardCheck size={17} />
                    {socialSaving ? "Saving" : "Save draft"}
                  </button>
                </div>
                <p className="text-xs font-semibold text-ink/52">{shareActionStatus}</p>
              </div>
            </div>
          </div>

          <details className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
            <summary className="cursor-pointer text-base font-semibold text-paper">Wave conversation</summary>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Affirmation Agent</p>
                <h3 className="mt-1 text-2xl font-semibold">Text with World Changers and World Enablers without open-season comments</h3>
                <p className="mt-2 text-sm leading-6 text-ink/66">
                  Messages, comments, and recruitment notes are checked for affirming language before they are sent.
                </p>
              </div>
              <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-gold/30 bg-gold/12 px-3 text-sm font-semibold text-gold">
                <Sparkles size={16} />
                Rewrite-first
              </span>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-3">
                <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
                  <label className="grid gap-1 text-sm font-semibold">
                    Message type
                    <select
                      value={messageMode}
                      onChange={(event) => setMessageMode(event.target.value as typeof messageMode)}
                      className="min-h-10 rounded-md border border-tide/40 bg-paper px-3 text-sm outline-none"
                    >
                      <option value="private_request">Private request</option>
                      <option value="recruitment">World Enabler recruitment</option>
                      <option value="event_update">World Enabler event update</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold">
                    Recipient
                    <select
                      value={recipientId}
                      onChange={(event) => setRecipientId(event.target.value)}
                      className="min-h-10 rounded-md border border-tide/40 bg-paper px-3 text-sm outline-none"
                    >
                      <option value="berkeley-county-meals-on-wheels">Berkeley County Meals on Wheels</option>
                      <option value="ccap-loaves-fishes">CCAP/Loaves & Fishes</option>
                      <option value="maya-rivera">Maya Rivera</option>
                      <option value="jordan-lee">Jordan Lee</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => void setAccountControl("muted", !hasMutedRecipient)}
                    className={`min-h-10 rounded-md px-3 text-sm font-semibold ${hasMutedRecipient ? "bg-gold text-ink" : "border border-ink/12 bg-paper text-ink/68"}`}
                  >
                    {hasMutedRecipient ? "Muted" : "Mute"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void setAccountControl("blocked", !hasBlockedRecipient)}
                    className={`min-h-10 rounded-md px-3 text-sm font-semibold ${hasBlockedRecipient ? "bg-coral text-white" : "border border-ink/12 bg-paper text-ink/68"}`}
                  >
                    {hasBlockedRecipient ? "Blocked" : "Block"}
                  </button>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Message preview</span>
                  <textarea
                    value={interactionMessage}
                    onChange={(event) => setInteractionMessage(event.target.value)}
                    rows={4}
                    className="min-h-28 resize-y rounded-md border border-ink/10 bg-paper px-3 py-2 text-sm leading-6 outline-none transition focus:border-tide"
                    placeholder="Write a comment, thank-you, invitation, or follow-up..."
                  />
                </label>
                <ModerationPanel
                  title="Comment standard"
                  moderation={interactionModeration}
                  onUseSuggestion={() => setInteractionMessage(interactionModeration.suggestion)}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={submitComment}
                    disabled={hasBlockedRecipient}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-moss px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/45"
                  >
                    <Megaphone size={17} />
                    Post comment
                  </button>
                  <button
                    type="button"
                    onClick={submitMessage}
                    disabled={hasBlockedRecipient}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-tide/35 bg-tide/15 px-3 text-sm font-semibold text-tide disabled:cursor-not-allowed disabled:border-ink/10 disabled:text-ink/45"
                  >
                    <UserCheck size={17} />
                    Send message request
                  </button>
                </div>
                {hasBlockedRecipient && <p className="text-sm font-semibold text-coral">This recipient is blocked, so new messages are paused.</p>}
              </div>
              <div className="rounded-lg border border-ink/10 bg-paper p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Agent rules</p>
                <div className="mt-3 grid gap-2">
                  {postingRules.map((rule) => (
                    <div key={rule} className="flex gap-2 rounded-md border border-white/10 bg-white/45 p-2 text-sm leading-5 text-ink/68">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-moss" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
            <summary className="cursor-pointer text-base font-semibold text-paper">Wave activity and controls</summary>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <SocialNotificationCenter
              notifications={socialNotifications}
              preferences={socialPreferences}
              onPreferenceChange={updateSocialPreference}
              onMarkRead={markSocialNotificationsRead}
            />
            <SocialLedgerPanel
              title="Saved drafts"
              emptyLabel="No saved drafts yet."
              loadState={socialLoadState}
              error={socialError}
              items={shareDrafts.map((draft) => ({
                id: draft.id,
                eyebrow: `${draft.platformId} · ${draft.templateId ?? "custom"}`,
                title: draft.message,
                detail: draft.updatedAt,
                actionLabel: "Load",
                onAction: () => loadShareDraft(draft)
              }))}
            />
            <SocialLedgerPanel
              title="Share history"
              emptyLabel="No share history yet."
              loadState={socialLoadState}
              error={socialError}
              items={shareHistory.map((item) => ({
                id: item.id,
                eyebrow: `${item.platformId} · ${item.status ?? "prepared"}`,
                title: item.preparedText.split("\n")[0] || "Prepared share",
                detail: item.createdAt,
                actionLabel: "Report share",
                onAction: () => reportSocialContent("share", item.id)
              }))}
            />
            <div className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Comment sorting</h3>
                  <p className="mt-1 text-sm text-ink/58">Choose which comments rise first in the in-app social review view.</p>
                </div>
                <select
                  value={commentSort}
                  onChange={(event) => setCommentSort(event.target.value as typeof commentSort)}
                  className="min-h-10 rounded-md border border-tide/40 bg-paper px-3 text-sm font-semibold outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="needs_review">Needs review</option>
                  <option value="ready">Ready / sent</option>
                </select>
              </div>
            </div>
            <SocialLedgerPanel
              title="Comments"
              emptyLabel="No in-app comments yet."
              loadState={socialLoadState}
              error={socialError}
              items={sortedSocialComments.map((comment) => ({
                id: comment.id,
                eyebrow: comment.status.replaceAll("_", " "),
                title: comment.approvedText,
                detail: `${comment.targetType} · ${comment.createdAt}`,
                actionLabel: "Report",
                onAction: () => reportSocialContent("comment", comment.id)
              }))}
            />
            <SocialLedgerPanel
              title="Messages"
              emptyLabel="No message requests yet."
              loadState={socialLoadState}
              error={socialError}
              items={socialMessages.map((message) => ({
                id: message.id,
                eyebrow: message.messageType.replaceAll("_", " "),
                title: message.approvedText,
                detail: `${message.recipientType} · ${message.recipientId}`,
                actionLabel: "Report",
                onAction: () => reportSocialContent("message", message.id)
              }))}
            />
            <SocialLedgerPanel
              title="Moderation timeline"
              emptyLabel="No reviews yet."
              loadState={socialLoadState}
              error={socialError}
              items={moderationReviews.map((review) => ({
                id: review.id,
                eyebrow: review.status,
                title: review.issues[0] ?? "Ready to post",
                detail: `${review.surface} · ${review.createdAt}`
              }))}
            />
            </div>

            <div className="mt-4 rounded-lg border border-ink/10 bg-paper p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral">Reports and controls</p>
                <h3 className="text-xl font-semibold">Account safety</h3>
              </div>
              <span className="rounded-md bg-paper px-3 py-2 text-sm font-semibold">{socialReports.length} reports</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-ink/10 bg-paper p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Open reports</p>
                {socialReports.length === 0 ? (
                  <p className="mt-2 text-sm text-ink/62">Nothing queued.</p>
                ) : (
                  <div className="mt-2 grid gap-2">
                    {socialReports.slice(0, 3).map((report) => (
                      <p key={report.id} className="text-sm leading-5 text-ink/66">
                        {report.contentType} · {report.reason} · {report.status}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-md border border-ink/10 bg-paper p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Muted / blocked</p>
                {accountControls.length === 0 ? (
                  <p className="mt-2 text-sm text-ink/62">No account controls active.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {accountControls.map((control) => (
                      <span key={`${control.targetId}-${control.control}`} className="rounded-md bg-ink px-2.5 py-1.5 text-xs font-semibold text-paper">
                        {control.control}: {control.targetId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </div>
          </details>

          <details className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
            <summary className="cursor-pointer text-base font-semibold text-paper">Public Handprint response</summary>
            <div className="mt-4 grid gap-4">
          <div className="rounded-lg border border-ink/10 bg-paper p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="text-tide" />
              <h3 className="text-xl font-semibold">Referral tracking</h3>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Metric label="Invited" value={String(referralState.invited)} />
              <Metric label="Confirmed" value={String(referralState.confirmedAttendees)} />
              <Metric label="Pending" value={String(referralState.pending)} />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/66">{referralState.rule.replace(/organizer/gi, "World Enabler")}</p>
          </div>

          <div className="rounded-lg border border-ink/10 bg-paper p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold" />
              <h3 className="text-xl font-semibold">What others will see</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {completed.slice(-4).map(({ mark, action }) => (
                <div key={mark.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <p className="font-semibold">{mark.label}</p>
                  <p className="mt-1 text-sm text-ink/62">
                    {action?.organizer} · {displayMarkSource(mark.source)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink/68">{action?.impact}</p>
                  {mark.badgeId && (
                    <a href={runtimePath(`/badges/${mark.badgeId}`)} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-tide">
                      View achievement
                      <ArrowRight size={15} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-paper p-4">
            <div className="flex items-center gap-2">
              <MapPinned className="text-tide" />
              <h3 className="text-xl font-semibold">How they can join in</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {nextActions.map((action) => (
                <a key={action.id} href={runtimePath(`/?join=${action.id}`)} className="rounded-md border border-ink/10 bg-paper p-3 transition hover:border-tide">
                  <p className="font-semibold">{action.title}</p>
                  <p className="mt-1 text-sm text-ink/62">
                    {action.startsAt} · {action.neighborhood} · {action.organizer}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tide">
                    Open this action
                    <ArrowRight size={15} />
                  </span>
                </a>
              ))}
            </div>
          </div>
            </div>
          </details>
        </div>
      </div>
      {sharePreviewOpen && (
        <SharePreviewModal
          platform={activeSharePlatform}
          status={postStatus}
          message={approvedShareMessage}
          preparedShareText={preparedShareText}
          tier={progress.currentTier.name}
          points={progress.points}
          badges={badges.length}
          qrUrl={qrUrl}
          onClose={() => setSharePreviewOpen(false)}
          onCopy={() => {
            void copyPreparedShare();
            setSharePreviewOpen(false);
          }}
        />
      )}
    </section>
  );
}

function SharePreviewModal({
  platform,
  status,
  message,
  preparedShareText,
  tier,
  points,
  badges,
  qrUrl,
  onClose,
  onCopy
}: {
  platform: SharePlatform;
  status: SharePostStatus;
  message: string;
  preparedShareText: string;
  tier: string;
  points: number;
  badges: number;
  qrUrl: string;
  onClose: () => void;
  onCopy: () => void;
}) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      restoreDialogFocus(previousFocus);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="share-preview-title" className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-white/10 bg-[#101a18] p-4 text-paper shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">{platform.label}</p>
            <h3 id="share-preview-title" className="mt-1 text-2xl font-semibold">Preview formatted post</h3>
            <p className="mt-1 text-sm text-paper/62">
              {platform.surface} · {platform.aspectRatio} · {status}
            </p>
          </div>
          <button type="button" autoFocus onClick={onClose} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-paper/70">
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div
            className="grid place-items-center rounded-lg border p-5 text-center"
            style={{
              aspectRatio: platform.aspectRatio,
              borderColor: platform.accent,
              background: `linear-gradient(145deg, ${platform.accent}33, rgba(15, 33, 29, 0.96))`
            }}
          >
            <div className="grid gap-3">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-lg border border-white/20 bg-white/10">
                <Hand size={34} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/62">HANDPRINT</p>
              <p className="text-3xl font-semibold">{publicHandprintProfile.displayName}'s Handprint</p>
              <p className="text-sm font-semibold text-tide">
                {tier} · {points} points · {badges} badges
              </p>
              <p className="text-sm leading-6 text-paper/78">{message}</p>
            </div>
          </div>

          <div className="grid content-start gap-3">
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/45">Caption kit</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-paper/78">{preparedShareText}</pre>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper/45">Live Handprint link</p>
              <p className="mt-1 break-all text-sm font-semibold text-tide">{qrUrl}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={onCopy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-moss px-3 text-sm font-semibold text-white">
                <Copy size={17} />
                Copy and record
              </button>
              <a
                href={runtimePath(`/api/share-card?platform=${platform.id}&format=png&message=${encodeURIComponent(message)}`)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-paper"
              >
                <ExternalLink size={17} />
                Download card
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModerationPanel({
  title,
  moderation,
  onUseSuggestion
}: {
  title: string;
  moderation: ModerationResult;
  onUseSuggestion: () => void;
}) {
  const ready = moderation.status === "ready";
  const escalated = moderation.status === "escalated";

  return (
    <div className={`rounded-lg border p-3 ${ready ? "border-moss/25 bg-moss/10" : escalated ? "border-coral/35 bg-coral/10" : "border-gold/35 bg-gold/10"}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{title}</p>
          <p className={`mt-1 text-sm font-semibold ${ready ? "text-moss" : escalated ? "text-coral" : "text-gold"}`}>
            {ready ? "Ready to post" : escalated ? "Human review needed" : "Rewrite suggested"}
          </p>
        </div>
        <span className={`inline-flex min-h-8 items-center gap-2 rounded-md px-2.5 text-xs font-semibold ${ready ? "bg-moss text-white" : escalated ? "bg-coral text-white" : "bg-gold text-ink"}`}>
          {ready ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          {ready ? "Affirming" : escalated ? "Escalate" : "Needs nudge"}
        </span>
      </div>
      {moderation.issues.length > 0 && (
        <div className="mt-3 grid gap-1">
          {moderation.issues.map((issue) => (
            <p key={issue} className="text-sm leading-5 text-ink/66">
              {issue}
            </p>
          ))}
        </div>
      )}
      {!ready && (
        <div className="mt-3 rounded-md border border-white/20 bg-paper p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Suggested rewrite</p>
          <p className="mt-1 text-sm leading-6 text-ink/72">{moderation.suggestion}</p>
          <button
            type="button"
            onClick={onUseSuggestion}
            className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper"
          >
            <Sparkles size={15} />
            Use rewrite
          </button>
        </div>
      )}
    </div>
  );
}

function SocialNotificationCenter({
  notifications,
  preferences,
  onPreferenceChange,
  onMarkRead
}: {
  notifications: SocialNotification[];
  preferences: SocialPreferences;
  onPreferenceChange: (patch: Partial<SocialPreferences>) => void;
  onMarkRead: (notificationIds?: string[]) => void;
}) {
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const toggles: { key: keyof SocialPreferences; label: string }[] = [
    { key: "notifyComments", label: "Comments" },
    { key: "notifyMessages", label: "Messages" },
    { key: "notifyReviews", label: "Reviews" },
    { key: "notifyReports", label: "Reports" },
    { key: "quietMode", label: "Quiet mode" }
  ];

  return (
    <div className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft xl:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral">Notifications</p>
          <h3 className="mt-1 text-xl font-semibold">Social activity center</h3>
          <p className="mt-1 text-sm text-ink/60">{unreadCount} items need attention across comments, messages, reports, and review decisions.</p>
        </div>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => onMarkRead()}
            disabled={!unreadCount}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
              unreadCount ? "bg-ink text-paper" : "cursor-not-allowed border border-ink/12 bg-paper text-ink/38"
            }`}
          >
            Mark all read
          </button>
          <div className="flex flex-wrap gap-2">
            {toggles.map((toggle) => {
              const enabled = Boolean(preferences[toggle.key]);
              return (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => onPreferenceChange({ [toggle.key]: !enabled })}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                    enabled ? "bg-moss text-white" : "border border-ink/12 bg-paper text-ink/50"
                  }`}
                >
                  {toggle.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {notifications.length ? (
          notifications.slice(0, 6).map((notification) => (
            <div key={notification.id} className="rounded-md border border-ink/10 bg-paper p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{notification.type}</p>
                  <p className="mt-1 text-sm font-semibold">{notification.title}</p>
                  <p className="mt-1 text-xs leading-5 text-ink/58">{notification.detail}</p>
                </div>
                {notification.unread && <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white">new</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-ink/12 bg-paper p-4 text-sm font-semibold text-ink/50 md:col-span-2">
            No social notifications yet.
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="grid gap-1 text-sm font-semibold">
          Message requests
          <select
            value={preferences.messageRequestPolicy}
            onChange={(event) => onPreferenceChange({ messageRequestPolicy: event.target.value as SocialPreferences["messageRequestPolicy"] })}
            className="min-h-10 rounded-md border border-tide/40 bg-paper px-3 text-sm outline-none"
          >
            <option value="everyone">Everyone</option>
            <option value="followed_network">Followed network first</option>
            <option value="event_network">Event network only</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => onPreferenceChange({ externalShareReviewRequired: !preferences.externalShareReviewRequired })}
          className={`min-h-10 rounded-md px-3 text-sm font-semibold ${
            preferences.externalShareReviewRequired ? "bg-moss text-white" : "border border-ink/12 bg-paper text-ink/58"
          }`}
        >
          {preferences.externalShareReviewRequired ? "External review on" : "External review off"}
        </button>
      </div>
    </div>
  );
}

function SocialLedgerPanel({
  title,
  emptyLabel,
  loadState,
  error,
  items
}: {
  title: string;
  emptyLabel: string;
  loadState: "loading" | "ready" | "error";
  error: string;
  items: {
    id: string;
    eyebrow: string;
    title: string;
    detail: string;
    actionLabel?: string;
    onAction?: () => void;
  }[];
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/108 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-semibold">{items.length}</span>
      </div>
      {loadState === "loading" && <p role="status" className="mt-3 text-sm text-ink/62">Loading Wave activity...</p>}
      {loadState === "error" && <p className="mt-3 text-sm font-semibold text-coral">{error || "Wave activity is unavailable."}</p>}
      {loadState !== "loading" && items.length === 0 && <p className="mt-3 text-sm text-ink/62">{emptyLabel}</p>}
      <div className="mt-3 grid gap-2">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-md border border-ink/10 bg-paper p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{item.eyebrow}</p>
                <p className="mt-1 text-sm font-semibold leading-5">{item.title}</p>
                <p className="mt-1 text-xs text-ink/58">{item.detail}</p>
              </div>
              {item.actionLabel && item.onAction && (
                <button type="button" onClick={item.onAction} className="shrink-0 rounded-md border border-ink/12 bg-white/50 px-2.5 py-1.5 text-xs font-semibold">
                  {item.actionLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardMomentPanel({ rewardMoment, onClose }: { rewardMoment: RewardMoment; onClose: () => void }) {
  const isCheckIn = rewardMoment.mark.source === "Check-in" || rewardMoment.mark.source === "Organizer confirmed";
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      restoreDialogFocus(previousFocus);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6">
      <section role="dialog" aria-modal="true" aria-labelledby="reward-moment-title" className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gold/40 bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">World Changer reward</p>
            <h2 id="reward-moment-title" className="mt-1 text-3xl font-semibold">{isCheckIn ? "Real-world mark earned" : "Commitment locked"}</h2>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-ink text-gold">
            <Trophy size={26} />
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-ink/10 bg-paper p-3">
            <p className="text-2xl font-semibold">{rewardMoment.mark.points}</p>
            <p className="text-xs text-ink/60">points earned</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper p-3">
            <p className="text-2xl font-semibold">+{rewardMoment.credits}</p>
            <p className="text-xs text-ink/60">appreciation credits</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-paper p-3">
            <p className="text-2xl font-semibold">{rewardMoment.badge ? "1" : "0"}</p>
            <p className="text-xs text-ink/60">badge unlocked</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-ink/10 bg-paper p-4">
          <p className="font-semibold">{rewardMoment.action.title}</p>
          <p className="mt-1 text-sm text-ink/66">{rewardMoment.action.organizer}</p>
          {rewardMoment.badge && (
            <div className="mt-3 rounded-md bg-white p-3">
              <p className="text-sm font-semibold text-coral">Badge eligible</p>
              <p className="mt-1 font-semibold">{rewardMoment.badge.title}</p>
              <p className="mt-1 text-sm leading-6 text-ink/66">{rewardMoment.badge.description}</p>
            </div>
          )}
        </div>

        <button type="button" autoFocus onClick={onClose} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
          Add it to my Handprint
          <Sparkles size={18} />
        </button>
      </section>
    </div>
  );
}

function OrganizerPanel({
  organizerProfiles,
  progress,
  canEditProfiles,
  onSubmit,
  onProfileUpdate
}: {
  organizerProfiles: OrganizerImpactProfile[];
  progress: ReturnType<typeof worldChangerProgress>;
  canEditProfiles: boolean;
  onSubmit: (draft: OrganizerDraft) => void;
  onProfileUpdate: (profile: Partial<OrganizerImpactProfile> & { id: string }) => void;
}) {
  const [editingOrganizerId, setEditingOrganizerId] = useState(organizerProfiles[0]?.id ?? "");
  const [draft, setDraft] = useState<OrganizerDraft>({
    title: "",
    organizer: "",
    neighborhood: "",
    startsAt: "",
    category: "Food support",
    listingType: "action",
    summary: "",
    skills: "",
    beneficiary: "",
    impactClaim: "",
    verificationPlan: "",
    sponsorDisclosure: "",
    fundraiserGoal: "",
    impactReceiptPlan: ""
  });
  const editingOrganizer = organizerProfiles.find((profile) => profile.id === editingOrganizerId) ?? organizerProfiles[0];
  const worldEnablerThreshold = 520;
  const worldEnablerUnlocked = progress.points >= worldEnablerThreshold;
  const pointsNeeded = Math.max(0, worldEnablerThreshold - progress.points);

  const update = (field: keyof OrganizerDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  if (!worldEnablerUnlocked) {
    return (
      <section className="grid gap-5">
        <div className="rounded-lg border border-gold/30 bg-gold/10 p-5 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">World Enabler signup</p>
              <h2 className="mt-1 text-3xl font-semibold">Host access unlocks through trusted action</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70">
                World Enablers create and steward opportunities for others. To protect trust, the portal unlocks after a World Changer has enough verified participation, referral quality, and community credibility to host responsibly.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-sm font-semibold">
              <p className="text-3xl">{progress.points}</p>
              <p className="text-ink/60">{pointsNeeded} points to Builder review</p>
            </div>
          </div>
          <div className="mt-5 h-3 rounded-full bg-white/20">
            <div className="h-3 rounded-full bg-gold" style={{ width: `${Math.min(100, (progress.points / worldEnablerThreshold) * 100)}%` }} />
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <ListChecks className="text-tide" />
            <h3 className="text-2xl font-semibold">World Enabler path</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {worldEnablerMilestones.map((milestone) => (
              <div key={milestone.title} className="grid gap-3 rounded-md border border-white/10 bg-paper p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full ${
                    milestone.status === "complete"
                      ? "bg-moss text-white"
                      : milestone.status === "active"
                        ? "bg-gold text-ink"
                        : "bg-white/10 text-paper/35"
                  }`}
                >
                  {milestone.status === "complete" ? <CheckCircle2 size={18} /> : <ListChecks size={18} />}
                </span>
                <div>
                  <p className="font-semibold">{milestone.title}</p>
                  <p className="text-sm leading-6 text-ink/64">{milestone.requirement}</p>
                </div>
                <span className="rounded-full bg-white/50 px-2.5 py-1 text-xs font-semibold text-ink/55">{milestone.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {[
            ["Verified participation", "Complete enough reward-eligible events that other World Enablers can trust your follow-through."],
            ["Referral credibility", "Recruit people who actually attend, contribute, and receive positive confirmation."],
            ["Do-ism fluency", "Show that you understand the difference between awareness, fundraising, training, and direct useful action."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
              <p className="font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-ink/66">{body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-moss" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Future portal preview</p>
              <h3 className="text-2xl font-semibold">What World Enablers unlock</h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Info label="Create actions" value="Submit events against the Do Something rubric" />
            <Info label="Confirm impact" value="Turn attendance into verified points and receipts" />
            <Info label="Earn accolades" value="Build a grant-ready World Enabler Handprint" />
            <Info label="Recruit networks" value="Invite aligned World Changers into useful roles" />
          </div>
          <button
            type="button"
            disabled
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-ink/10 px-4 font-semibold text-ink/45"
          >
            World Enabler portal locked
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <MapPinned className="mt-1 text-tide" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">World Enablers</p>
            <h2 className="text-3xl font-semibold">World Enabler Handprint</h2>
            <p className="mt-2 max-w-3xl text-ink/70">
              Handprint should help World Enablers fill useful roles, build a verified mobilization record, raise support elegantly, and earn evidence-backed accolades that can matter in grants and community trust.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="World Enabler profiles" value={String(organizerProfiles.length)} />
          <Metric label="Confirmed volunteers" value={String(organizerProfiles.reduce((sum, org) => sum + org.confirmedParticipants, 0))} />
          <Metric label="Volunteer hours" value={String(organizerProfiles.reduce((sum, org) => sum + org.volunteerHours, 0))} />
          <Metric label="Accolades earned" value={String(organizerProfiles.reduce((sum, org) => sum + org.accolades.filter((item) => item.status === "approved").length, 0))} />
        </div>

        <div className="mt-5 rounded-lg border border-moss/25 bg-moss/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">Portal operating model</p>
          <div className="mt-3 grid gap-3 md:grid-cols-5">
            {worldEnablerMilestones.map((milestone) => (
              <Info key={milestone.title} label={milestone.title} value={milestone.requirement} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {organizerProfiles.map((profile) => (
          <OrganizerImpactCard key={profile.id} profile={profile} />
        ))}
      </div>

      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-moss" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">World Enabler onboarding</p>
            <h2 className="text-2xl font-semibold">Ready before submission</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Identity", "Who is hosting and how they can be reached"],
            ["Do Something rubric", "Beneficiary, concrete action, and reward eligibility"],
            ["Confirmation plan", "How attendance and impact are verified"],
            ["Receipt plan", "What gets published after the event is done"]
          ].map(([label, value]) => (
            <Info key={label} label={label} value={value} />
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/68">
          New event submissions now create or update a World Enabler Handprint in the ledger, then move the action into Review for approval.
        </p>
      </div>

      {editingOrganizer && (
        <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Profile editing</p>
            <h2 className="text-2xl font-semibold">World Enabler profile</h2>
            <p className="mt-1 text-xs font-semibold text-ink/50">
              Permission role: {canEditProfiles ? "World Enabler editor" : "Viewer only"}
            </p>
          </div>
            <select
              value={editingOrganizer.id}
              onChange={(event) => setEditingOrganizerId(event.target.value)}
              className="min-h-11 rounded-md border border-ink/15 bg-paper px-3 text-sm font-semibold outline-none focus:border-tide"
            >
              {organizerProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field
              label="Organization name"
              value={editingOrganizer.name}
              disabled={!canEditProfiles}
              onChange={(value) => onProfileUpdate({ id: editingOrganizer.id, name: value })}
            />
            <Field
              label="Organization type"
              value={editingOrganizer.type}
              disabled={!canEditProfiles}
              onChange={(value) => onProfileUpdate({ id: editingOrganizer.id, type: value })}
            />
          </div>
          <label className="mt-3 grid gap-1 text-sm font-semibold">
            Public summary
            <textarea
              value={editingOrganizer.publicSummary}
              disabled={!canEditProfiles}
              onChange={(event) => onProfileUpdate({ id: editingOrganizer.id, publicSummary: event.target.value })}
              className="min-h-24 rounded-md border border-ink/15 bg-paper p-3 font-normal outline-none focus:border-tide"
            />
          </label>
          <label className="mt-3 grid gap-1 text-sm font-semibold">
            Grant-ready summary
            <textarea
              value={editingOrganizer.grantReadySummary}
              disabled={!canEditProfiles}
              onChange={(event) => onProfileUpdate({ id: editingOrganizer.id, grantReadySummary: event.target.value })}
              className="min-h-24 rounded-md border border-ink/15 bg-paper p-3 font-normal outline-none focus:border-tide"
            />
          </label>
        </div>
      )}

      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <MapPinned className="text-tide" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">World Enabler</p>
            <h2 className="text-2xl font-semibold">Put a useful action within reach</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Field label="Action title" value={draft.title} onChange={(value) => update("title", value)} />
          <Field label="World Enabler" value={draft.organizer} onChange={(value) => update("organizer", value)} />
          <Field label="Neighborhood" value={draft.neighborhood} onChange={(value) => update("neighborhood", value)} />
          <Field label="Starts at" value={draft.startsAt} onChange={(value) => update("startsAt", value)} placeholder="Thu 6:00 PM" />
          <label className="grid gap-1 text-sm font-semibold">
            Listing type
            <select
              value={draft.listingType}
              onChange={(event) => update("listingType", event.target.value)}
              className="min-h-11 rounded-md border border-ink/15 bg-paper px-3 font-normal outline-none focus:border-tide"
            >
              {["action", "awareness", "sponsored", "training", "fundraiser"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Category
            <select
              value={draft.category}
              onChange={(event) => update("category", event.target.value)}
              className="min-h-11 rounded-md border border-ink/15 bg-paper px-3 font-normal outline-none focus:border-tide"
            >
              {allCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <Field label="Skills needed" value={draft.skills} onChange={(value) => update("skills", value)} placeholder="Logistics, Welcoming" />
          <Field label="Beneficiary" value={draft.beneficiary} onChange={(value) => update("beneficiary", value)} placeholder="Who benefits?" />
          <Field label="Impact claim" value={draft.impactClaim} onChange={(value) => update("impactClaim", value)} placeholder="What will be done?" />
          <Field label="Verification plan" value={draft.verificationPlan} onChange={(value) => update("verificationPlan", value)} placeholder="How will this be confirmed?" />
          <Field label="Sponsor disclosure" value={draft.sponsorDisclosure} onChange={(value) => update("sponsorDisclosure", value)} placeholder="Required for sponsored listings" />
          <Field label="Fundraiser goal" value={draft.fundraiserGoal} onChange={(value) => update("fundraiserGoal", value)} placeholder="What will supporters help make possible?" />
          <Field label="Impact receipt plan" value={draft.impactReceiptPlan} onChange={(value) => update("impactReceiptPlan", value)} placeholder="What accomplishment will be reported after?" />
        </div>

        <label className="mt-3 grid gap-1 text-sm font-semibold">
          Summary
          <textarea
            value={draft.summary}
            onChange={(event) => update("summary", event.target.value)}
            className="min-h-28 rounded-md border border-ink/15 bg-paper p-3 font-normal outline-none focus:border-tide"
            placeholder="Describe the action, arrival expectations, and useful work."
          />
        </label>

        <div className="mt-4 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-ink/72">
          Do Something rubric: name a beneficiary, describe concrete impact, separate awareness from action, and provide a post-event confirmation plan before rewards are issued.
        </div>

        <button type="button" onClick={() => onSubmit(draft)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
          <Plus size={18} />
          Submit for review
        </button>
      </div>
    </section>
  );
}

function OrganizerImpactCard({ profile }: { profile: OrganizerImpactProfile }) {
  const approvedAccolades = profile.accolades.filter((accolade) => accolade.status === "approved");
  const pendingAccolades = profile.accolades.length - approvedAccolades.length;
  const sponsorRoom = Math.max(0, profile.sponsorSlotsLimit - profile.sponsorSlotsUsed);
  const credibilityScore = calculateWorldEnablerCredibility(profile);

  return (
    <article className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{profile.trustTier}</p>
          <h3 className="mt-1 text-2xl font-semibold">{profile.name}</h3>
          <p className="mt-1 text-sm font-semibold text-ink/56">{profile.type}</p>
          <p className="mt-3 text-sm leading-6 text-ink/70">{profile.publicSummary}</p>
        </div>
        <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
          <Award size={17} className="text-gold" />
          {approvedAccolades.length} accolades
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric label="attendees mobilized" value={String(profile.attendeesMobilized)} />
        <Metric label="confirmed" value={String(profile.confirmedParticipants)} />
        <Metric label="volunteer hours" value={String(profile.volunteerHours)} />
      </div>

      <div className="mt-4 rounded-lg border border-tide/25 bg-tide/10 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-tide">World Enabler credibility</p>
            <p className="mt-1 text-sm leading-6 text-ink/68">
              Score blends confirmed participation, repeat trust, verified proof, and sponsor restraint. It should guide unlocks, not replace human review.
            </p>
          </div>
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-tide/35 bg-paper text-2xl font-semibold text-tide">
            {credibilityScore}
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/30">
          <div className="h-2 rounded-full bg-tide" style={{ width: `${credibilityScore}%` }} />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-moss/25 bg-moss/10 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-moss" />
          <p className="font-semibold">Impact proof</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {profile.impactHighlights.map((highlight) => (
            <Info key={highlight.label} label={highlight.label} value={highlight.value} />
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/68">{profile.fundraisingPolicy}</p>
      </div>

      <div className="mt-4 rounded-lg border border-gold/30 bg-gold/10 p-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-gold" />
          <p className="font-semibold">Grant-ready proof</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-ink/70">{profile.grantReadySummary}</p>
      </div>

      <div className="mt-4 grid gap-3">
        {profile.accolades.map((accolade) => (
          <div key={accolade.id} className="rounded-md border border-ink/10 bg-paper p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{accolade.category}</p>
                <p className="mt-1 font-semibold">{accolade.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink/66">{accolade.description}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  accolade.status === "approved" ? "text-white" : "bg-white text-ink/55"
                }`}
                style={accolade.status === "approved" ? { backgroundColor: accolade.accent } : undefined}
              >
                {accolade.status === "approved" ? accolade.issuedAt : "review"}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-ink/55">{accolade.evidence}</p>
            <a href={runtimePath(`/organizations/${profile.handle}/accolades/${accolade.id}`)} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-tide">
              View accolade
              <ArrowRight size={15} />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-ink/10 bg-paper p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Sponsored visibility rule</p>
        <p className="mt-1 text-sm leading-6 text-ink/66">{profile.sponsorPolicy}</p>
        <p className="mt-2 text-xs font-semibold text-ink/55">
          {profile.sponsorSlotsUsed}/{profile.sponsorSlotsLimit} sponsor slots active · {sponsorRoom} available before density limit
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <a href={runtimePath(`/organizations/${profile.handle}`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
          Public page
          <ExternalLink size={15} />
        </a>
        <a href={runtimePath(`/organizations/${profile.handle}/grant-report`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold">
          Grant preview
          <ClipboardCheck size={15} />
        </a>
        <a href={runtimePath(`/impact-receipts/${profile.impactReceiptIds[0]}`)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold">
          Impact receipt
          <ArrowRight size={15} />
        </a>
      </div>

      {pendingAccolades > 0 && <p className="mt-3 text-xs font-semibold text-coral">{pendingAccolades} accolade waiting for review.</p>}
    </article>
  );
}

function calculateWorldEnablerCredibility(profile: OrganizerImpactProfile) {
  const attendanceScore = Math.min(35, Math.round(profile.confirmedParticipants / 6));
  const hoursScore = Math.min(20, Math.round(profile.volunteerHours / 18));
  const accoladeScore = Math.min(20, profile.accolades.filter((accolade) => accolade.status === "approved").length * 7);
  const repeatScore = Math.min(15, Math.round(profile.repeatOrganizerRate * 15));
  const sponsorDensity = profile.sponsorSlotsLimit ? profile.sponsorSlotsUsed / profile.sponsorSlotsLimit : 0;
  const sponsorStewardshipScore = Math.max(0, 10 - Math.round(sponsorDensity * 8));
  return Math.max(1, Math.min(100, attendanceScore + hoursScore + accoladeScore + repeatScore + sponsorStewardshipScore));
}

function TrustPanel({
  actions,
  organizerProfiles,
  impactReceipts,
  organizationReviewQueue,
  socialReviewQueue,
  socialReportQueue,
  canReview,
  onUpdate,
  onSocialReview,
  onResolveSocialReport,
  onAccoladeStatusChange,
  onSponsorSlotChange,
  onCreateImpactReceipt,
  onOrganizerReviewNote,
  onSelect
}: {
  actions: LocalAction[];
  organizerProfiles: OrganizerImpactProfile[];
  impactReceipts: ImpactReceipt[];
  organizationReviewQueue: OrganizationReviewQueueItem[];
  socialReviewQueue: SocialModerationReview[];
  socialReportQueue: SocialReport[];
  canReview: boolean;
  onUpdate: (actionId: string, status: EventStatus, trustTier?: TrustTier) => void;
  onSocialReview: (reviewId: string, decision: "approved" | "rewrite" | "hold", reviewerNote?: string) => void;
  onResolveSocialReport: (reportId: string, status: "resolved" | "reviewing", resolutionNote?: string) => void;
  onAccoladeStatusChange: (organizerId: string, accoladeId: string, status: "approved" | "pending_review", note?: string) => void;
  onSponsorSlotChange: (organizerId: string, sponsorSlotsUsed: number, sponsorSlotsLimit: number, note?: string) => void;
  onCreateImpactReceipt: (confirmation: (typeof organizerConfirmations)[number]) => void;
  onOrganizerReviewNote: (organizerId: string, note: string) => void;
  onSelect: (actionId: string) => void;
}) {
  const queue = [...actions].sort((a, b) => statusRank(a.status) - statusRank(b.status));
  const prioritizedSocialReviews = [...socialReviewQueue].sort((a, b) => {
    const statusPriority = Number(b.status === "escalated") - Number(a.status === "escalated");
    if (statusPriority !== 0) return statusPriority;
    return (b.confidence ?? 0) - (a.confidence ?? 0) || b.createdAt.localeCompare(a.createdAt);
  });
  const sponsorTimeline = organizerProfiles
    .flatMap((organizer) =>
      (organizer.sponsorSlotAudit ?? []).map((entry) => ({
        ...entry,
        organizerName: organizer.name
      }))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <section className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-moss" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Review</p>
          <h2 className="text-2xl font-semibold">Trust queue</h2>
          <p className="mt-1 text-xs font-semibold text-ink/50">
            Permission role: {canReview ? "Handprint reviewer" : "Viewer only"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-ink/10 bg-paper p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-coral" />
          <h3 className="font-semibold">Affirmation Agent queue</h3>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {prioritizedSocialReviews.length ? (
            prioritizedSocialReviews.slice(0, 8).map((review) => (
              <div key={review.id} className="rounded-md border border-ink/10 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{review.surface}</p>
                    <p className="mt-1 text-sm font-semibold">{review.status}</p>
                  </div>
                  <div className="grid justify-items-end gap-1">
                    <span className="rounded-full bg-coral/12 px-2.5 py-1 text-xs font-semibold text-coral">{review.createdAt.slice(0, 10)}</span>
                    <span className="text-xs font-semibold text-ink/45">{Math.round((review.confidence ?? 0.72) * 100)}% confidence</span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/68">{review.issues.join("; ") || "Needs reviewer attention."}</p>
                <p className="mt-2 rounded-md bg-paper p-2 text-sm leading-6 text-ink/72">{review.suggestion}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => onSocialReview(review.id, "approved", "Approved from review queue.")}
                    disabled={!canReview}
                    className="min-h-9 rounded-md bg-moss px-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/45"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onSocialReview(review.id, "rewrite", "Rewrite remains required.")}
                    disabled={!canReview}
                    className="min-h-9 rounded-md border border-ink/12 bg-paper px-2 text-xs font-semibold disabled:cursor-not-allowed disabled:text-ink/45"
                  >
                    Rewrite
                  </button>
                  <button
                    type="button"
                    onClick={() => onSocialReview(review.id, "hold", "Held for human follow-up.")}
                    disabled={!canReview}
                    className="min-h-9 rounded-md border border-coral/25 bg-coral/10 px-2 text-xs font-semibold text-coral disabled:cursor-not-allowed disabled:text-ink/45"
                  >
                    Hold
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-ink/10 bg-white p-3 text-sm font-semibold text-ink/58">
              No social messages are waiting for review.
            </div>
          )}
          <div className="rounded-md border border-ink/10 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Open reports</p>
            {socialReportQueue.length ? (
              <div className="mt-2 grid gap-2">
                {socialReportQueue.slice(0, 6).map((report) => (
                  <div key={report.id} className="rounded-md border border-ink/10 bg-paper p-2">
                    <p className="text-sm font-semibold leading-6 text-ink/72">
                      {report.contentType} · {report.reason}
                    </p>
                    <p className="text-xs text-ink/52">{report.status}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onResolveSocialReport(report.id, "reviewing", "Reviewer opened this report.")}
                        disabled={!canReview || report.status === "reviewing"}
                        className="rounded-md border border-ink/12 bg-white px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:text-ink/38"
                      >
                        Mark reviewing
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveSocialReport(report.id, "resolved", "Resolved from review queue.")}
                        disabled={!canReview}
                        className="rounded-md bg-moss px-2.5 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/45"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm font-semibold text-ink/58">No reports queued.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-ink/10 bg-paper p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-coral" />
          <h3 className="font-semibold">Possible duplicate organizations</h3>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {organizationReviewQueue.length ? (
            organizationReviewQueue.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-md border border-ink/10 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{item.status.replaceAll("_", " ")}</p>
                    <p className="mt-1 font-semibold">{item.submittedName}</p>
                  </div>
                  <span className="rounded-full bg-gold/14 px-2.5 py-1 text-xs font-semibold text-ink">{item.createdAt.slice(0, 10)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/68">{item.reason}</p>
                {item.duplicateOfName && <p className="mt-2 text-xs font-semibold text-coral">Possible match: {item.duplicateOfName}</p>}
              </div>
            ))
          ) : (
            <div className="rounded-md border border-ink/10 bg-white p-3 text-sm font-semibold text-ink/58">
              No duplicate organization submissions are waiting.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-ink/10 bg-paper p-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="text-tide" />
          <h3 className="font-semibold">Reviewer timeline</h3>
        </div>
        <div className="mt-3 grid gap-2">
          {sponsorTimeline.length ? (
            sponsorTimeline.slice(0, 8).map((entry) => (
              <div key={entry.id} className="rounded-md border border-ink/10 bg-white p-3 text-sm">
                <p className="font-semibold">{entry.organizerName}</p>
                <p className="mt-1 text-ink/65">
                  Sponsor slots changed from {entry.previousUsed}/{entry.previousLimit} to {entry.nextUsed}/{entry.nextLimit}.
                </p>
                <p className="mt-1 text-xs text-ink/52">
                  {entry.createdAt} · {entry.author}: {entry.note}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-ink/10 bg-white p-3 text-sm font-semibold text-ink/58">
              Sponsor slot changes will appear here as reviewers adjust sponsored visibility.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {queue.map((action) => (
          <div key={action.id} className="rounded-lg border border-ink/10 bg-paper p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <button type="button" onClick={() => onSelect(action.id)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{action.title}</h3>
                  <StatusBadge status={action.status} trustTier={action.trustTier} />
                </div>
                <p className="mt-1 text-sm text-ink/65">
                  {action.organizer} · {action.neighborhood}
                </p>
                <p className="mt-2 text-sm text-ink/72">{action.reviewNote}</p>
                <div className="mt-3 grid gap-2 text-sm text-ink/66 md:grid-cols-3">
                  <Info label="Beneficiary" value={action.beneficiary} />
                  <Info label="Impact claim" value={action.impactClaim} />
                  <Info label="Verify by" value={action.verificationPlan} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ListingBadge action={action} />
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink/62">
                    {confirmationLabel(action.confirmationStatus)}
                  </span>
                  {action.rewardEligible ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/12 px-2.5 py-1 text-xs font-semibold text-ink">
                      <Trophy size={13} />
                      {action.reward.basePoints}+{action.reward.organizerConfirmedBonus} possible
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/7 px-2.5 py-1 text-xs font-semibold text-ink/62">
                      <EyeOff size={13} />
                      no reward points
                    </span>
                  )}
                  {action.reward.badgeId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral">
                      <Award size={13} />
                      issue {badgeById(action.reward.badgeId)?.title ?? "badge"}
                    </span>
                  )}
                </div>
              </button>
              <div className="flex shrink-0 gap-2">
                <button type="button"
                  onClick={() => onUpdate(action.id, "escalated", "Escalated")}
                  disabled={!canReview}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-semibold"
                >
                  <ShieldAlert size={16} />
                  Escalate
                </button>
                <button type="button"
                  onClick={() => onUpdate(action.id, "approved", "Verified")}
                  disabled={!canReview}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-moss px-3 text-sm font-semibold text-white"
                >
                  <Sparkles size={16} />
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-ink/10 bg-paper p-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="text-tide" />
          <h3 className="font-semibold">Post-event confirmations</h3>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {organizerConfirmations.map((confirmation) => (
            <div key={confirmation.id} className="rounded-md border border-ink/10 bg-white p-3">
              <p className="font-semibold">{actions.find((action) => action.id === confirmation.actionId)?.title ?? confirmation.actionId}</p>
              <p className="mt-1 text-sm text-ink/62">
                {confirmation.organizer} · {confirmation.pointsAwarded} pts
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/66">{confirmation.evidence}</p>
              {confirmation.badgeId && <p className="mt-2 text-xs font-semibold text-coral">Badge control: {badgeById(confirmation.badgeId)?.title}</p>}
              <button type="button"
                onClick={() => onCreateImpactReceipt(confirmation)}
                disabled={!canReview}
                className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper"
              >
                <ClipboardCheck size={15} />
                {impactReceipts.some((receipt) => receipt.createdFromConfirmationId === confirmation.id) ? "Refresh receipt" : "Create receipt"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-ink/10 bg-paper p-4">
        <div className="flex items-center gap-2">
          <Megaphone className="text-coral" />
          <h3 className="font-semibold">Sponsor slot controls</h3>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {organizerProfiles.map((organizer) => (
            <div key={organizer.id} className="rounded-md border border-ink/10 bg-white p-3">
              <p className="font-semibold">{organizer.name}</p>
              <p className="mt-1 text-sm text-ink/62">{organizer.sponsorPolicy}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button"
                  onClick={() => onSponsorSlotChange(organizer.id, organizer.sponsorSlotsUsed - 1, organizer.sponsorSlotsLimit, "Reviewer reduced active sponsor slots.")}
                  disabled={!canReview}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/12 bg-white"
                >
                  <Minus size={15} />
                </button>
                <span className="rounded-md bg-paper px-3 py-2 text-sm font-semibold">
                  {organizer.sponsorSlotsUsed}/{organizer.sponsorSlotsLimit} active
                </span>
                <button type="button"
                  onClick={() => onSponsorSlotChange(organizer.id, organizer.sponsorSlotsUsed + 1, organizer.sponsorSlotsLimit, "Reviewer increased active sponsor slots.")}
                  disabled={!canReview}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/12 bg-white"
                >
                  <Plus size={15} />
                </button>
                <button type="button"
                  onClick={() => onSponsorSlotChange(organizer.id, organizer.sponsorSlotsUsed, organizer.sponsorSlotsLimit + 1, "Reviewer expanded sponsor slot limit.")}
                  disabled={!canReview}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper"
                >
                  Add slot
                </button>
              </div>
              {!!organizer.sponsorSlotAudit?.length && (
                <div className="mt-3 rounded-md bg-paper p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Sponsor audit</p>
                  {organizer.sponsorSlotAudit.slice(0, 2).map((entry) => (
                    <p key={entry.id} className="mt-1 text-xs leading-5 text-ink/62">
                      {entry.createdAt}: {entry.previousUsed}/{entry.previousLimit} to {entry.nextUsed}/{entry.nextLimit}. {entry.note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-ink/10 bg-paper p-4">
        <div className="flex items-center gap-2">
          <Award className="text-gold" />
          <h3 className="font-semibold">World Enabler accolade controls</h3>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {organizerProfiles.flatMap((organizer) =>
            organizer.accolades.map((accolade) => (
              <AccoladeReviewCard
                key={`${organizer.id}-${accolade.id}`}
                organizer={organizer}
                accolade={accolade}
                canReview={canReview}
                onAccoladeStatusChange={onAccoladeStatusChange}
                onOrganizerReviewNote={onOrganizerReviewNote}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function AccoladeReviewCard({
  organizer,
  accolade,
  canReview,
  onAccoladeStatusChange,
  onOrganizerReviewNote
}: {
  organizer: OrganizerImpactProfile;
  accolade: OrganizerImpactProfile["accolades"][number];
  canReview: boolean;
  onAccoladeStatusChange: (organizerId: string, accoladeId: string, status: "approved" | "pending_review", note?: string) => void;
  onOrganizerReviewNote: (organizerId: string, note: string) => void;
}) {
  const [note, setNote] = useState("");
  const applyDecision = (status: "approved" | "pending_review") => {
    onAccoladeStatusChange(organizer.id, accolade.id, status, note);
    setNote("");
  };

  return (
    <div className="rounded-md border border-ink/10 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{organizer.name}</p>
          <p className="mt-1 font-semibold">{accolade.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink/66">{accolade.evidence}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accolade.status === "approved" ? "bg-moss/10 text-moss" : "bg-gold/12 text-ink"}`}>
          {accolade.status.replaceAll("_", " ")}
        </span>
      </div>
      <label className="mt-3 grid gap-1 text-sm font-semibold">
        Trust-review note
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Why approve, hold, or request more evidence?"
          className="min-h-10 rounded-md border border-ink/15 bg-paper px-3 font-normal outline-none focus:border-tide"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button"
          onClick={() => applyDecision("approved")}
          disabled={!canReview}
          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-moss px-3 text-sm font-semibold text-white"
        >
          <CheckCircle2 size={15} />
          Approve
        </button>
        <button type="button"
          onClick={() => applyDecision("pending_review")}
          disabled={!canReview}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold"
        >
          <ShieldAlert size={15} />
          Hold
        </button>
        <button type="button"
          onClick={() => {
            onOrganizerReviewNote(organizer.id, note);
            setNote("");
          }}
          disabled={!canReview}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold"
        >
          <ClipboardCheck size={15} />
          Add note
        </button>
      </div>
      {!!accolade.reviewHistory?.length && (
        <div className="mt-3 rounded-md bg-paper p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Approval history</p>
          <div className="mt-2 grid gap-2">
            {accolade.reviewHistory.slice(0, 3).map((history) => (
              <p key={history.id} className="text-xs leading-5 text-ink/65">
                <span className="font-semibold">{history.createdAt}:</span> {history.note}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        className="min-h-11 rounded-md border border-ink/15 bg-paper px-3 font-normal outline-none focus:border-tide disabled:cursor-not-allowed disabled:text-ink/45"
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
}

function ReasonList({ reasons }: { reasons: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {reasons.map((reason) => (
        <span key={reason} className="rounded-full border border-ink/10 bg-paper px-2.5 py-1 text-xs font-semibold text-ink/70">
          {reason}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status, trustTier }: { status: EventStatus; trustTier: TrustTier }) {
  const styles =
    status === "approved"
      ? "bg-moss/12 text-moss"
      : status === "pending"
        ? "bg-gold/14 text-ink"
        : "bg-coral/12 text-coral";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{status === "approved" ? trustTier : status}</span>;
}

function ListingBadge({ action }: { action: LocalAction }) {
  const label = action.rewardEligible ? "Earns rewards" : action.listingType === "sponsored" ? "Sponsored" : "Awareness only";
  const styles = action.rewardEligible
    ? "bg-gold/14 text-ink"
    : action.listingType === "sponsored"
      ? "bg-coral/12 text-coral"
      : "bg-ink/7 text-ink/62";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{label}</span>;
}

function activeChipStyle(color: string): CSSProperties {
  return {
    backgroundColor: color,
    borderColor: color,
    color: "#ffffff"
  };
}

function chipStyle(color: string, isActive: boolean): CSSProperties {
  return {
    backgroundColor: isActive ? color : `${color}26`,
    borderColor: isActive ? color : `${color}66`,
    color: isActive ? "#ffffff" : "#faf8f3"
  };
}

function skillColor(skill: string) {
  return skillColors[skill] ?? skillEnabledColor;
}

function confirmationLabel(status: LocalAction["confirmationStatus"]) {
  if (status === "organizer_confirmed") return "World Enabler confirmed";
  if (status === "beneficiary_attested") return "Beneficiary attested";
  if (status === "needs_review") return "Needs review";
  return "Self check-in";
}

function displayMarkSource(source: string) {
  return source === "Organizer confirmed" ? "World Enabler confirmed" : source;
}

function labelRsvp(status: RsvpStatus) {
  if (status === "checked_in") return "Checked in";
  if (status === "confirmed") return "Confirmed";
  if (status === "saved") return "Saved";
  return "Going";
}

function organizerForAction(action: LocalAction, organizers: OrganizerImpactProfile[]) {
  return findDuplicateOrganizerClient(organizers, action.organizer);
}

function findDuplicateOrganizerClient(organizers: OrganizerImpactProfile[], name: string) {
  const normalized = normalizeOrgNameClient(name);
  return organizers.find((organizer) => {
    const candidate = normalizeOrgNameClient(organizer.name);
    return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate) || hasStrongTokenOverlapClient(candidate, normalized);
  });
}

function normalizeOrgNameClient(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(
      /\b(the|inc|incorporated|llc|corp|corporation|company|co|nonprofit|non-profit|organization|org|foundation|association|center|centre|church|ministries|ministry|services|service)\b/g,
      ""
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findNearestKnownCity(lat: number, lon: number) {
  return knownCities.reduce((nearest, city) => {
    const distance = distanceBetweenCoordinates(lat, lon, city.lat, city.lon);
    return distance < nearest.distance ? { city, distance } : nearest;
  }, { city: knownCities[0], distance: Number.POSITIVE_INFINITY }).city;
}

function distanceBetweenCoordinates(latA: number, lonA: number, latB: number, lonB: number) {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(latB - latA);
  const dLon = toRadians(lonB - lonA);
  const originLat = toRadians(latA);
  const destinationLat = toRadians(latB);
  const haversine =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * earthRadiusMiles * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function hasStrongTokenOverlapClient(candidate: string, normalized: string) {
  const candidateTokens = new Set(candidate.split(" ").filter((token) => token.length > 2));
  const normalizedTokens = new Set(normalized.split(" ").filter((token) => token.length > 2));
  if (candidateTokens.size < 2 || normalizedTokens.size < 2) return false;
  const shared = Array.from(normalizedTokens).filter((token) => candidateTokens.has(token)).length;
  const smallest = Math.min(candidateTokens.size, normalizedTokens.size);
  return shared >= 2 && shared / smallest >= 0.66;
}

function createOrganizerProfileFromDraft(draft: OrganizerDraft, actionId: string, createdAt: number): OrganizerImpactProfile {
  const name = draft.organizer || "New organizer";
  return {
    id: `org-${slugify(name)}-${createdAt}`,
    handle: `${slugify(name)}-${String(createdAt).slice(-5)}`,
    name,
    type: draft.listingType === "fundraiser" ? "Community fundraiser" : "Pilot organizer",
    trustTier: "Pending review",
    publicSummary: draft.summary || "New organizer profile created from a submitted Handprint action.",
    savedByViewer: false,
    onboardingStatus: "ready_for_review",
    permissionRoles: ["organizer_editor"],
    onboardingSteps: [
      { label: "Identity", value: "Submitted with first action" },
      { label: "Rubric", value: draft.impactClaim || "Impact claim pending review" },
      { label: "Receipt", value: draft.impactReceiptPlan || "Receipt plan pending review" }
    ],
    eventsHosted: 1,
    attendeesMobilized: 0,
    confirmedParticipants: 0,
    volunteerHours: 0,
    handprintPointsIssued: 0,
    repeatOrganizerRate: 0,
    sponsorSlotsUsed: draft.listingType === "sponsored" ? 1 : 0,
    sponsorSlotsLimit: draft.listingType === "sponsored" ? 1 : 0,
    sponsorSlotAudit:
      draft.listingType === "sponsored"
        ? [
            {
              id: `sponsor-audit-${createdAt}`,
              createdAt: new Date(createdAt).toISOString(),
              author: "Organizer onboarding",
              authorRole: "organizer_editor",
              previousUsed: 0,
              nextUsed: 1,
              previousLimit: 0,
              nextLimit: 1,
              note: "Sponsored submission requested one initial visibility slot pending Handprint review."
            }
          ]
        : [],
    featuredEventIds: [actionId],
    impactHighlights: [
      { label: "First submitted action", value: draft.title || "Untitled action" },
      { label: "Beneficiary", value: draft.beneficiary || "Pending review" },
      { label: "Verification", value: draft.verificationPlan || "Pending review" }
    ],
    impactReceiptIds: [],
    sponsorPolicy: "Sponsored visibility must be labeled and cannot buy Handprint points, badges, or organizer accolades.",
    fundraisingPolicy: "Fundraising asks should point to the concrete action made possible and publish an impact receipt after completion.",
    grantReadySummary: "Grant preview will become stronger as events are approved, attendance is confirmed, and impact receipts are issued.",
    reviewNotes: [
      {
        id: `trust-note-${createdAt}`,
        createdAt: new Date(createdAt).toISOString(),
        author: "Organizer onboarding",
        note: "Profile created from organizer event submission and queued for trust review.",
        status: "needs_evidence"
      }
    ],
    accolades: [
      {
        id: `accolade-${slugify(name)}-first-action`,
        title: "First Action Submitted",
        category: "Mobilization",
        description: "Created an organizer profile and submitted a first action for Handprint review.",
        issuedAt: "Pilot",
        evidence: draft.verificationPlan || "Awaiting trust review and event verification plan.",
        status: "pending_review",
        accent: "#c99a35",
        reviewHistory: [
          {
            id: `trust-history-${createdAt}`,
            createdAt: new Date(createdAt).toISOString(),
            author: "Organizer onboarding",
            note: "Pending until the first event is approved and confirmation evidence is supplied.",
            status: "needs_evidence"
          }
        ]
      }
    ]
  };
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "organizer"
  );
}

function buildExternalShareUrl(platform: SharePlatform, url: string, text: string) {
  if (platform.shareKind !== "external-link") return "";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  if (platform.id === "facebook") {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  }

  if (platform.id === "linkedin") {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }

  return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
}

function preparedShareTextLength(message: string, hashtags: string[], url: string) {
  return [message, hashtags.join(" "), url].filter(Boolean).join("\n").length;
}

function evaluateHandprintMessage(message: string): ModerationResult {
  const trimmed = message.trim();

  if (!trimmed) {
    return {
      status: "rewrite",
      issues: ["Add a short, positive invitation before posting."],
      suggestion: defaultShareMessage
    };
  }

  const issues = discouragingLanguageRules.filter((rule) => rule.pattern.test(trimmed)).map((rule) => rule.issue);
  const hasUsefulActionLanguage = /\b(join|help|serve|show up|volunteer|build|support|thank|invite|welcome|learn|repair|clean|pack|mentor|give|pick|come|action)\b/i.test(trimmed);
  const hasVerifiedClaimRisk = /\b(guaranteed|officially proves|best ever|everyone knows|no one else)\b/i.test(trimmed);
  const hasSevereLanguage = /\b(kill|violent|violence|dox|doxx|threat|threaten)\b/i.test(trimmed);

  if (hasVerifiedClaimRisk) {
    issues.push("Big claims should be tied to what Handprint can verify.");
  }

  if (!hasUsefulActionLanguage) {
    issues.push("Add a useful next step, thank-you, or invitation.");
  }

  if (hasSevereLanguage) {
    issues.push("Severe language needs human review before it can publish.");
  }

  if (issues.length === 0) {
    return {
      status: "ready",
      issues: [],
      suggestion: trimmed
    };
  }

  return {
    status: hasSevereLanguage ? "escalated" : "rewrite",
    issues,
    suggestion: rewriteHandprintMessage(trimmed)
  };
}

function rewriteHandprintMessage(message: string) {
  const lowered = message.toLowerCase();

  if (lowered.includes("frustrat") || lowered.includes("angry") || lowered.includes("hate")) {
    return `I am frustrated by what needs to change, and I want to turn that energy into useful action. ${publicHandprintProfile.inviteText}`;
  }

  if (lowered.includes("idiot") || lowered.includes("stupid") || lowered.includes("trash") || lowered.includes("worthless")) {
    return `I want to focus less on blame and more on what we can do next. ${publicHandprintProfile.inviteText}`;
  }

  if (message.length < 48) {
    return `${message} ${publicHandprintProfile.inviteText}`;
  }

  return `${message} I am sharing this as an invitation to do something useful together.`;
}

function statusRank(status: EventStatus) {
  if (status === "pending") return 0;
  if (status === "escalated") return 1;
  return 2;
}
