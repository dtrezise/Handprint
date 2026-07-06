"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleUserRound,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Hand,
  ListChecks,
  MapPinned,
  Minus,
  Plus,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Share2,
  SlidersHorizontal,
  Sparkles,
  UserCheck
} from "lucide-react";
import { HandprintVisual } from "@/components/HandprintVisual";
import {
  categoryIcon,
  createMark,
  defaultProfile,
  initialMarks,
  localActions,
  scoreAction,
  statIcon,
  type EventCategory,
  type EventStatus,
  type HandprintMark,
  type LocalAction,
  type OrganizerDraft,
  type Recommendation,
  type RsvpStatus,
  type TrustTier,
  type UserProfile,
  publicHandprintProfile
} from "@/lib/handprint-data";

type Tab = "Discover" | "My reach" | "Share" | "Organize" | "Review";
type RsvpMap = Record<string, RsvpStatus>;

const tabs: Tab[] = ["Discover", "My reach", "Share", "Organize", "Review"];
const allCategories: EventCategory[] = ["Food support", "Cleanup", "Mentoring", "Mutual aid", "Civic forum", "Arts community", "Preparedness"];
const allSkills = ["Writing", "Logistics", "Mentoring", "Welcoming", "Outdoor work", "Questions", "Creative support", "Packing"];
const storageKey = "handprint:first-draft-state";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Discover");
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [actions, setActions] = useState<LocalAction[]>(localActions);
  const [selectedId, setSelectedId] = useState(localActions[0].id);
  const [rsvps, setRsvps] = useState<RsvpMap>({ "tenant-rights-clinic": "checked_in" });
  const [marks, setMarks] = useState<HandprintMark[]>(initialMarks);
  const [hydrated, setHydrated] = useState(false);
  const [shareUrl, setShareUrl] = useState(publicHandprintProfile.sharePath);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as {
        profile: UserProfile;
        actions: LocalAction[];
        selectedId: string;
        rsvps: RsvpMap;
        marks: HandprintMark[];
      };
      setProfile(parsed.profile);
      setActions(parsed.actions);
      setSelectedId(parsed.selectedId);
      setRsvps(parsed.rsvps);
      setMarks(parsed.marks);
    }
    setShareUrl(`${window.location.origin}${publicHandprintProfile.sharePath}`);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ profile, actions, selectedId, rsvps, marks }));
  }, [actions, hydrated, marks, profile, rsvps, selectedId]);

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

  const stats = useMemo(() => {
    const approved = actions.filter((action) => action.status === "approved");
    const verified = actions.filter((action) => action.trustTier === "Verified" || action.trustTier === "Anchor partner");
    return [
      { label: "Useful actions", value: String(approved.length), icon: statIcon.useful },
      { label: "Within reach", value: String(actions.filter((action) => action.distanceMiles <= profile.radiusMiles).length), icon: statIcon.radius },
      { label: "Trusted hosts", value: String(verified.length), icon: statIcon.verified },
      { label: "Joining", value: String(actions.reduce((sum, action) => sum + action.attending + (rsvps[action.id] ? 1 : 0), 0)), icon: statIcon.people }
    ];
  }, [actions, profile.radiusMiles, rsvps]);

  const addParticipation = (action: LocalAction, status: RsvpStatus) => {
    setSelectedId(action.id);
    setRsvps((current) => ({ ...current, [action.id]: status }));
    const nextMark = createMark(action, status);
    setMarks((current) => {
      const withoutExisting = current.filter((mark) => !(mark.eventId === action.id && mark.source === nextMark.source));
      return [...withoutExisting, nextMark];
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

  const submitDraft = (draft: OrganizerDraft) => {
    const newAction: LocalAction = {
      id: `draft-${Date.now()}`,
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
      accent: "#1f7a8c"
    };
    setActions((current) => [newAction, ...current]);
    setSelectedId(newAction.id);
    setActiveTab("Review");
  };

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedShareUrl(true);
    window.setTimeout(() => setCopiedShareUrl(false), 1800);
  };

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[300px_minmax(0,1fr)_390px]">
        <aside className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:overflow-auto">
          <BrandBlock />
          <ProfilePanel profile={profile} onProfileChange={setProfile} />
          <StatsGrid stats={stats} />
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <section className="min-w-0">
          {activeTab === "Discover" && (
            <DiscoverView
              recommendations={recommendations}
              selectedId={selectedId}
              rsvps={rsvps}
              onSelect={setSelectedId}
              onRsvp={(action) => addParticipation(action, "going")}
            />
          )}
          {activeTab === "My reach" && (
            <ReachView
              profile={profile}
              marks={marks}
              rsvps={rsvps}
              actions={actions}
              onProfileChange={setProfile}
            />
          )}
          {activeTab === "Share" && <ShareView shareUrl={shareUrl} marks={marks} actions={actions} onCopy={copyShareUrl} copied={copiedShareUrl} />}
          {activeTab === "Organize" && <OrganizerPanel onSubmit={submitDraft} />}
          {activeTab === "Review" && <TrustPanel actions={actions} onUpdate={updateActionReview} onSelect={setSelectedId} />}
        </section>

        <aside className="grid content-start gap-5 lg:sticky lg:top-5">
          <HandprintVisual marks={marks} activeEventId={selectedAction.id} />
          <EventDetail
            recommendation={selectedRecommendation}
            rsvpStatus={rsvps[selectedAction.id]}
            onRsvp={() => addParticipation(selectedAction, "going")}
            onCheckIn={() => addParticipation(selectedAction, "checked_in")}
          />
        </aside>
      </div>
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

function ProfilePanel({ profile, onProfileChange }: { profile: UserProfile; onProfileChange: (profile: UserProfile) => void }) {
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

  return (
    <div className="mt-6 rounded-lg border border-ink/10 bg-paper p-3">
      <div className="flex items-center gap-2">
        <CircleUserRound size={20} />
        <input
          value={profile.name}
          onChange={(event) => onProfileChange({ ...profile, name: event.target.value })}
          className="min-h-9 w-full rounded-md border border-transparent bg-white px-2 font-semibold outline-none focus:border-tide"
        />
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Launch community</label>
      <input
        value={profile.launchCommunity}
        onChange={(event) => onProfileChange({ ...profile, launchCommunity: event.target.value })}
        className="mt-1 min-h-10 w-full rounded-md border border-ink/10 bg-white px-3 text-sm outline-none focus:border-tide"
      />

      <label className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
        Radius <span>{profile.radiusMiles} mi</span>
      </label>
      <input
        type="range"
        min="1"
        max="15"
        value={profile.radiusMiles}
        onChange={(event) => onProfileChange({ ...profile, radiusMiles: Number(event.target.value) })}
        className="mt-2 w-full accent-tide"
      />

      <ChipEditor title="Interests" items={allCategories} active={profile.interests} onToggle={toggleCategory} />
      <ChipEditor title="Skills" items={allSkills} active={profile.skills} onToggle={toggleSkill} />
    </div>
  );
}

function ChipEditor<T extends string>({ title, items, active, onToggle }: { title: string; items: T[]; active: T[]; onToggle: (item: T) => void }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = active.includes(item);
          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              className={`inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition ${
                isActive ? "bg-ink text-paper" : "bg-white text-ink/68 hover:bg-ink/5"
              }`}
            >
              {isActive ? <Minus size={12} /> : <Plus size={12} />}
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: { label: string; value: string; icon: typeof ListChecks }[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-lg border border-ink/10 bg-white p-3">
            <Icon size={18} className="text-tide" />
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-ink/60">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function TabNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`min-h-10 rounded-md px-2 text-sm font-semibold transition ${
            activeTab === tab ? "bg-ink text-paper" : "border border-ink/10 bg-white text-ink/68 hover:bg-paper"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function DiscoverView({
  recommendations,
  selectedId,
  rsvps,
  onSelect,
  onRsvp
}: {
  recommendations: Recommendation[];
  selectedId: string;
  rsvps: RsvpMap;
  onSelect: (id: string) => void;
  onRsvp: (action: LocalAction) => void;
}) {
  return (
    <>
      <div className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Discover</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal sm:text-4xl">Useful action this week</h2>
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/10 bg-paper px-4 font-semibold text-ink">
            <Radar size={18} />
            Sphere ranking active
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {recommendations.map((recommendation) => (
          <ActionCard
            key={recommendation.action.id}
            recommendation={recommendation}
            selected={selectedId === recommendation.action.id}
            rsvpStatus={rsvps[recommendation.action.id]}
            onSelect={() => onSelect(recommendation.action.id)}
            onRsvp={() => onRsvp(recommendation.action)}
          />
        ))}
      </div>
    </>
  );
}

function ActionCard({
  recommendation,
  selected,
  rsvpStatus,
  onSelect,
  onRsvp
}: {
  recommendation: Recommendation;
  selected: boolean;
  rsvpStatus?: RsvpStatus;
  onSelect: () => void;
  onRsvp: () => void;
}) {
  const { action, score, reasons } = recommendation;
  const Icon = categoryIcon[action.category];
  const spotsLeft = action.capacity - action.attending - (rsvpStatus ? 1 : 0);
  const isPublic = action.status === "approved";

  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm transition ${
        selected ? "border-tide ring-2 ring-tide/15" : "border-ink/10 hover:border-ink/25"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <button onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${action.accent}18`, color: action.accent }}>
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold leading-tight">{action.title}</h3>
                <StatusBadge status={action.status} trustTier={action.trustTier} />
              </div>
              <p className="text-sm text-ink/60">{action.organizer}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink/72">{action.summary}</p>
          <ReasonList reasons={reasons} />
        </button>

        <div className="grid min-w-[164px] gap-2 md:justify-items-end">
          <ScoreMeter score={score} />
          <p className="text-sm font-semibold">{action.startsAt}</p>
          <p className="text-xs text-ink/60">
            {action.neighborhood} · {action.distanceMiles} mi
          </p>
          <p className="text-xs text-ink/60">{Math.max(0, spotsLeft)} spots left</p>
          <button
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
  rsvpStatus,
  onRsvp,
  onCheckIn
}: {
  recommendation: Recommendation;
  rsvpStatus?: RsvpStatus;
  onRsvp: () => void;
  onCheckIn: () => void;
}) {
  const { action, reasons } = recommendation;
  const isApproved = action.status === "approved";
  return (
    <section className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral">Selected action</p>
          <h2 className="mt-1 text-xl font-semibold">{action.title}</h2>
        </div>
        <StatusBadge status={action.status} trustTier={action.trustTier} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-ink/72">
        <p>{action.summary}</p>
        <div className="grid grid-cols-2 gap-2">
          <Info label="When" value={`${action.startsAt}, ${action.duration}`} />
          <Info label="Where" value={action.neighborhood} />
          <Info label="Impact" value={action.impact} />
          <Info label="Organizer" value={action.organizer} />
        </div>
      </div>

      <div className="mt-4 rounded-md border border-ink/10 bg-paper p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Safety note</p>
        <p className="mt-1 text-sm text-ink/72">{action.safetyNote}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold">Why this matches</p>
        <ReasonList reasons={reasons} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onRsvp}
          disabled={!isApproved}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 font-semibold ${
            isApproved ? "bg-ink text-paper" : "cursor-not-allowed bg-ink/10 text-ink/45"
          }`}
        >
          {rsvpStatus ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
          {rsvpStatus ? labelRsvp(rsvpStatus) : "Join"}
        </button>
        <button
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
    </section>
  );
}

function ReachView({
  profile,
  marks,
  rsvps,
  actions,
  onProfileChange
}: {
  profile: UserProfile;
  marks: HandprintMark[];
  rsvps: RsvpMap;
  actions: LocalAction[];
  onProfileChange: (profile: UserProfile) => void;
}) {
  const going = Object.values(rsvps).filter((status) => status === "going").length;
  const checkedIn = Object.values(rsvps).filter((status) => status === "checked_in" || status === "confirmed").length;

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">My reach</p>
            <h2 className="mt-1 text-3xl font-semibold">Pilot identity profile</h2>
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-paper px-4 font-semibold">
            <Sparkles size={18} className="text-gold" />
            {marks.length} visible marks
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Metric label="RSVPs active" value={String(going)} />
          <Metric label="Checked in" value={String(checkedIn)} />
          <Metric label="Categories touched" value={String(new Set(marks.map((mark) => mark.category)).size)} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-tide" />
            <h3 className="text-xl font-semibold">Reach controls</h3>
          </div>
          <ChipEditor title="Interests" items={allCategories} active={profile.interests} onToggle={(category) => {
            const interests = profile.interests.includes(category)
              ? profile.interests.filter((item) => item !== category)
              : [...profile.interests, category];
            onProfileChange({ ...profile, interests });
          }} />
          <ChipEditor title="Skills" items={allSkills} active={profile.skills} onToggle={(skill) => {
            const skills = profile.skills.includes(skill) ? profile.skills.filter((item) => item !== skill) : [...profile.skills, skill];
            onProfileChange({ ...profile, skills });
          }} />
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-coral" />
            <h3 className="text-xl font-semibold">Participation trail</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {marks.slice().reverse().map((mark) => {
              const action = actions.find((item) => item.id === mark.eventId);
              return (
                <div key={mark.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <p className="font-semibold">{mark.label}</p>
                  <p className="mt-1 text-sm text-ink/62">
                    {mark.source} · {action?.organizer ?? "Organizer"} · weight {mark.weight}
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

function ShareView({
  shareUrl,
  marks,
  actions,
  onCopy,
  copied
}: {
  shareUrl: string;
  marks: HandprintMark[];
  actions: LocalAction[];
  onCopy: () => void;
  copied: boolean;
}) {
  const completed = marks
    .map((mark) => ({ mark, action: actions.find((action) => action.id === mark.eventId) }))
    .filter(({ action }) => action);
  const nextActions = actions.filter((action) => action.status === "approved" && !marks.some((mark) => mark.eventId === action.id)).slice(0, 3);

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Share</p>
            <h2 className="mt-1 text-3xl font-semibold">Your public Handprint</h2>
            <p className="mt-2 max-w-2xl text-ink/70">
              This is the pride loop: a personal icon people can share like a profile link, but it points to proof of useful action and what to join next.
            </p>
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-tide/10 px-4 font-semibold text-tide">
            <Share2 size={18} />
            @{publicHandprintProfile.handle}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <HandprintVisual marks={marks} />
          <div className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Share link</p>
            <p className="mt-1 break-all text-sm font-semibold">{shareUrl}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={onCopy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
                <Copy size={17} />
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={publicHandprintProfile.sharePath}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold"
              >
                <ExternalLink size={17} />
                Open
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold" />
              <h3 className="text-xl font-semibold">What others will see</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {completed.slice(-4).map(({ mark, action }) => (
                <div key={mark.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <p className="font-semibold">{mark.label}</p>
                  <p className="mt-1 text-sm text-ink/62">
                    {action?.organizer} · {mark.source}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <MapPinned className="text-tide" />
              <h3 className="text-xl font-semibold">How they can join in</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {nextActions.map((action) => (
                <div key={action.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <p className="font-semibold">{action.title}</p>
                  <p className="mt-1 text-sm text-ink/62">
                    {action.startsAt} · {action.neighborhood} · {action.organizer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrganizerPanel({ onSubmit }: { onSubmit: (draft: OrganizerDraft) => void }) {
  const [draft, setDraft] = useState<OrganizerDraft>({
    title: "",
    organizer: "",
    neighborhood: "",
    startsAt: "",
    category: "Food support",
    summary: "",
    skills: ""
  });

  const update = (field: keyof OrganizerDraft, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <section className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <MapPinned className="text-tide" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Organize</p>
          <h2 className="text-2xl font-semibold">Submit a local action</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Field label="Action title" value={draft.title} onChange={(value) => update("title", value)} />
        <Field label="Organizer" value={draft.organizer} onChange={(value) => update("organizer", value)} />
        <Field label="Neighborhood" value={draft.neighborhood} onChange={(value) => update("neighborhood", value)} />
        <Field label="Starts at" value={draft.startsAt} onChange={(value) => update("startsAt", value)} placeholder="Thu 6:00 PM" />
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
        New organizer actions enter the pilot review queue before they appear as joinable.
      </div>

      <button onClick={() => onSubmit(draft)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
        <Plus size={18} />
        Submit for review
      </button>
    </section>
  );
}

function TrustPanel({
  actions,
  onUpdate,
  onSelect
}: {
  actions: LocalAction[];
  onUpdate: (actionId: string, status: EventStatus, trustTier?: TrustTier) => void;
  onSelect: (actionId: string) => void;
}) {
  const queue = [...actions].sort((a, b) => statusRank(a.status) - statusRank(b.status));

  return (
    <section className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-moss" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Review</p>
          <h2 className="text-2xl font-semibold">Trust queue</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {queue.map((action) => (
          <div key={action.id} className="rounded-lg border border-ink/10 bg-paper p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <button onClick={() => onSelect(action.id)} className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{action.title}</h3>
                  <StatusBadge status={action.status} trustTier={action.trustTier} />
                </div>
                <p className="mt-1 text-sm text-ink/65">
                  {action.organizer} · {action.neighborhood}
                </p>
                <p className="mt-2 text-sm text-ink/72">{action.reviewNote}</p>
              </button>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => onUpdate(action.id, "escalated", "Escalated")}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/15 bg-white px-3 text-sm font-semibold"
                >
                  <ShieldAlert size={16} />
                  Escalate
                </button>
                <button
                  onClick={() => onUpdate(action.id, "approved", "Verified")}
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
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        className="min-h-11 rounded-md border border-ink/15 bg-paper px-3 font-normal outline-none focus:border-tide"
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

function labelRsvp(status: RsvpStatus) {
  if (status === "checked_in") return "Checked in";
  if (status === "confirmed") return "Confirmed";
  if (status === "saved") return "Saved";
  return "Going";
}

function statusRank(status: EventStatus) {
  if (status === "pending") return 0;
  if (status === "escalated") return 1;
  return 2;
}
