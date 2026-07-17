import Link from "next/link";
import { ArrowRight, Award, CalendarDays, Hand, Heart, MapPin, Share2, ShieldCheck, Sparkles, Target, Trophy, Users } from "lucide-react";
import { HandprintVisual } from "@/components/HandprintVisual";
import { QrCodeCard } from "@/components/QrCodeCard";
import { SocialInteractionPanel } from "@/components/SocialInteractionPanel";
import {
  completedHighlights,
  earnedBadges,
  initialMarks,
  nextJoinableActions,
  publicHandprintProfile,
  publicQrState,
  worldChangerProgress
} from "@/lib/handprint-data";
import { readPublicCommentCounts, readPublicComments } from "@/lib/server/social-ledger";
import { publicSiteUrl } from "@/lib/runtime-url";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [{ handle: publicHandprintProfile.handle }];
}

export default function PublicHandprintPage({ params }: { params: { handle: string } }) {
  const handle = params.handle.toLowerCase();
  const isKnownProfile = handle === publicHandprintProfile.handle;
  const completed = completedHighlights();
  const nextActions = nextJoinableActions();
  const progress = worldChangerProgress(initialMarks);
  const badges = earnedBadges(initialMarks);
  const comments = readPublicComments("public_profile", publicHandprintProfile.handle);
  const badgeCommentCounts = readPublicCommentCounts(badges.map((badge) => ({ targetType: "achievement", targetId: badge.id })));

  if (!isKnownProfile) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Handprint</p>
          <h1 className="mt-2 text-3xl font-semibold">This handprint is not public yet.</h1>
          <p className="mt-3 text-ink/68">Open Handprint to find useful local action and start building a public record of your own.</p>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
            Open Handprint
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-5 flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-paper">
              <Hand size={22} />
            </span>
            Handprint
          </Link>
          <Link href="/?join=welcome-table" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-semibold">
            Join in
            <ArrowRight size={16} />
          </Link>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          <div className="py-4 sm:py-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-tide/10 px-3 text-sm font-semibold text-tide">
                <Share2 size={16} />
                @{publicHandprintProfile.handle}
              </span>
              <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-moss/10 px-3 text-sm font-semibold text-moss">
                <ShieldCheck size={16} />
                Verified participation
              </span>
              <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-gold/15 px-3 text-sm font-semibold text-ink">
                <Trophy size={16} />
                {progress.currentTier.name}
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">{publicHandprintProfile.displayName}'s Handprint</h1>
            <p className="mt-3 max-w-3xl text-xl font-semibold leading-8 text-ink">{publicHandprintProfile.headline}</p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/72">{publicHandprintProfile.statement}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/?join=welcome-table" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 font-semibold text-paper">
                Join a next action
                <ArrowRight size={18} />
              </Link>
              <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-5 font-semibold">
                Start your Handprint
                <Hand size={18} />
              </Link>
            </div>

            <div className="mt-6 max-w-2xl rounded-lg border border-gold/30 bg-gold/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">World Changer status</p>
                  <p className="mt-1 text-3xl font-semibold">{progress.points} points</p>
                </div>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-ink text-gold">
                  <Trophy size={28} />
                </span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white">
                <div className="h-3 rounded-full bg-gold" style={{ width: `${progress.progressToNext}%` }} />
              </div>
              <p className="mt-2 text-sm text-ink/68">
                {progress.nextTier
                  ? `${progress.nextTier.minPoints - progress.points} points to ${progress.nextTier.name}.`
                  : "World Changer tier unlocked."}
              </p>
            </div>
          </div>

          <HandprintVisual marks={initialMarks} />
        </section>

        <section className="mt-3 grid gap-3 sm:grid-cols-3">
          {publicHandprintProfile.highlights.map((highlight) => (
            <div key={highlight.label} className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft">
              <p className="text-3xl font-semibold">{highlight.value}</p>
              <p className="mt-1 text-sm text-ink/62">{highlight.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Award className="text-gold" />
              <h2 className="text-2xl font-semibold">Badge wall</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {badges.map((badge) => (
                <div key={badge.id} className="rounded-lg border border-ink/10 bg-paper p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{badge.title}</p>
                      <p className="mt-1 text-sm leading-6 text-ink/66">{badge.description}</p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: badge.accent }}>
                      {badge.category}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink/55">
                    {badge.verification} · {badge.issuedBy}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-tide">
                    {badgeCommentCounts[`achievement:${badge.id}`] ?? 0} affirming comments
                  </p>
                  <Link href={`/badges/${badge.id}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tide">
                    View achievement
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid content-start gap-5">
            <QrCodeCard
              title={`${publicHandprintProfile.displayName}'s Handprint`}
              publicUrl={publicSiteUrl(publicQrState.fallbackUrl)}
              fallbackUrl={publicSiteUrl(publicQrState.fallbackUrl)}
              tier={progress.currentTier.name}
              points={progress.points}
              enabled={publicQrState.enabled}
              rotatedAt={publicQrState.rotatedAt}
              designNote={publicQrState.designNote}
            />

            <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <Heart className="text-coral" />
                <h2 className="text-xl font-semibold">Earned appreciation</h2>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <PublicMetric icon={Heart} label="Earned" value={String(publicHandprintProfile.appreciationCredits.earned)} />
                <PublicMetric icon={Share2} label="Given" value={String(publicHandprintProfile.appreciationCredits.spent)} />
                <PublicMetric icon={Sparkles} label="Available" value={String(publicHandprintProfile.appreciationCredits.available)} />
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold" />
              <h2 className="text-2xl font-semibold">What this handprint has done</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/66">
              These marks are meant to feel earned: specific, local, and connected to a trusted World Enabler.
            </p>

            <div className="mt-4 grid gap-3">
              {completed.map(({ mark, action }) => (
                <div key={mark.id} className="rounded-lg border border-ink/10 bg-paper p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{mark.label}</p>
                      <p className="mt-1 text-sm text-ink/65">
                        {action?.organizer ?? "Verified World Enabler"} · {mark.category} · {mark.source === "Organizer confirmed" ? "World Enabler confirmed" : mark.source}
                      </p>
                      {action && <p className="mt-2 text-sm leading-6 text-ink/70">{action.impact}</p>}
                    </div>
                    <span className="inline-flex min-h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-ink/62">
                      {mark.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <MapPin className="text-tide" />
                <h2 className="text-xl font-semibold">Current reach</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <PublicMetric icon={CalendarDays} label="Visible marks" value={String(initialMarks.length)} />
                <PublicMetric icon={Users} label="Home area" value={publicHandprintProfile.locationLabel} />
                <PublicMetric icon={Trophy} label="Badges" value={String(badges.length)} />
                <PublicMetric icon={Award} label="Tier" value={progress.currentTier.name} />
              </div>
            </div>

            <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <Target className="text-coral" />
                <h2 className="text-xl font-semibold">Current focus</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {publicHandprintProfile.currentFocus.map((focus) => (
                  <div key={focus.title} className="rounded-md border border-ink/10 bg-paper p-3">
                    <p className="font-semibold">{focus.title}</p>
                    <p className="mt-1 text-sm leading-6 text-ink/66">{focus.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Join in</p>
              <h2 className="mt-1 text-2xl font-semibold">What Dan is doing next</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/66">{publicHandprintProfile.inviteText}</p>
            </div>
            <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/12 bg-paper px-4 text-sm font-semibold">
              See all actions
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {nextActions.map((action) => (
              <Link key={action.id} href={`/?join=${action.id}`} className="rounded-lg border border-ink/10 bg-paper p-4 transition hover:border-tide hover:bg-white">
                <p className="font-semibold">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-ink/64">
                  {action.startsAt} · {action.neighborhood}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/70">{action.impact}</p>
                <p className={`mt-2 text-sm font-semibold ${action.rewardEligible ? "text-gold" : "text-ink/55"}`}>
                  {action.rewardEligible ? `${action.reward.basePoints} World Changer points` : "Awareness only"}
                </p>
                {action.unofficialListing && (
                  <p className="mt-2 text-xs font-semibold text-ink/50">
                    Unofficial example from {action.sourceName}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tide">
                  Join this action
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-5">
          <SocialInteractionPanel
            title="Affirm this Handprint"
            targetType="public_profile"
            targetId={publicHandprintProfile.handle}
            initialComments={comments}
            allowAccountControls
          />
        </div>
      </div>
    </main>
  );
}

function PublicMetric({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-3">
      <Icon size={18} className="text-tide" />
      <p className="mt-2 text-lg font-semibold">{value}</p>
      <p className="text-xs text-ink/58">{label}</p>
    </div>
  );
}
