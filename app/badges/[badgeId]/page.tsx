import Link from "next/link";
import { ArrowLeft, Award, BadgeCheck, CalendarDays, ClipboardCheck, Hand, Medal, ShieldCheck, Sparkles, Stamp, Trophy, UserCheck } from "lucide-react";
import { SocialInteractionPanel } from "@/components/SocialInteractionPanel";
import {
  actionById,
  badgeById,
  initialMarks,
  organizerConfirmations,
  publicHandprintProfile,
  type OrganizerConfirmation,
  type RewardBadge
} from "@/lib/handprint-data";
import { readPublicComments } from "@/lib/server/social-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  const confirmed = organizerConfirmations.filter((confirmation) => confirmation.badgeId).map((confirmation) => ({ badgeId: confirmation.badgeId! }));
  const earned = initialMarks.filter((mark) => mark.badgeId).map((mark) => ({ badgeId: mark.badgeId! }));
  return [...confirmed, ...earned].filter((param, index, all) => all.findIndex((item) => item.badgeId === param.badgeId) === index);
}

export default function BadgeDetailPage({ params }: { params: { badgeId: string } }) {
  const badge = badgeById(params.badgeId);
  const confirmations = organizerConfirmations.filter((confirmation) => confirmation.badgeId === params.badgeId);
  const primaryConfirmation = confirmations[0] ?? fallbackConfirmation(params.badgeId);
  const action = primaryConfirmation ? actionById(primaryConfirmation.actionId) : undefined;
  const issuedDate = badge?.earnedAt ?? primaryConfirmation?.confirmedAt ?? "Pending";
  const achievementId = primaryConfirmation ? achievementNumber(primaryConfirmation.id) : achievementNumber(params.badgeId);
  const comments = readPublicComments("achievement", params.badgeId);

  if (!badge) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Badge</p>
          <h1 className="mt-2 text-3xl font-semibold">Badge not found.</h1>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
            <ArrowLeft size={18} />
            Back to Handprint
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/u/dan" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/68">
          <ArrowLeft size={16} />
          Dan's Handprint
        </Link>

        <section className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative border-b border-ink/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: badge.accent }} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex min-h-9 items-center gap-2 rounded-full bg-gold/12 px-3 text-sm font-semibold text-ink">
                  <Stamp size={16} />
                  Verified Handprint achievement
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Record {achievementId}</p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
                <BadgeSeal badge={badge} />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Celebrated contribution</p>
                  <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{badge.title}</h1>
                  <p className="mt-3 max-w-2xl text-lg leading-8 text-ink/70">{badge.description}</p>
                </div>
              </div>

              <div className="mt-8 rounded-lg border border-ink/10 bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">This celebrates</p>
                <p className="mt-2 text-3xl font-semibold">{publicHandprintProfile.displayName}</p>
                <p className="mt-3 text-base leading-7 text-ink/72">
                  for showing up to <span className="font-semibold text-ink">{action?.title ?? badge.title}</span>
                  {action?.organizer ? (
                    <>
                      {" "}
                      with <span className="font-semibold text-ink">{action.organizer}</span>
                    </>
                  ) : null}
                  {action?.impact ? `, helping create this impact: ${action.impact}.` : "."}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <CertificateMetric icon={Trophy} label="Points earned" value={`${primaryConfirmation?.pointsAwarded ?? badge.pointsInfluence}`} />
                <CertificateMetric icon={ShieldCheck} label="Affirmed by" value={primaryConfirmation?.organizer ?? badge.issuedBy} />
                <CertificateMetric icon={CalendarDays} label="Added to Handprint" value={issuedDate} />
              </div>

              <div className="mt-5 rounded-lg border border-moss/25 bg-moss/10 p-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 shrink-0 text-moss" />
                  <div>
                    <p className="font-semibold">World Enabler affirmation</p>
                    <p className="mt-1 text-sm leading-6 text-ink/70">
                      {primaryConfirmation?.evidence ??
                        `${badge.issuedBy} is listed as the affirming World Enabler. Additional notes can be attached as the achievement record matures.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="grid content-between gap-5 bg-ink p-6 text-paper sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-paper text-ink">
                    <Hand size={24} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Handprint</p>
                    <p className="text-lg font-semibold">World Changer record</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <SideFact icon={Award} label="Badge category" value={badge.category} />
                  <SideFact icon={UserCheck} label="Recipient" value={`@${publicHandprintProfile.handle}`} />
                  <SideFact icon={Medal} label="Verification" value={badge.verification} />
                  <SideFact icon={Sparkles} label="World Enabler" value={primaryConfirmation?.organizer ?? badge.issuedBy} />
                </div>
              </div>

              <div className="rounded-lg border border-paper/12 bg-white/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/52">Achievement use</p>
                    <p className="mt-2 text-sm leading-6 text-paper/74">
                  This page is a praise record with evidence underneath: what happened, who affirmed it, and how many Handprint points it earned.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-tide" />
            <h2 className="text-2xl font-semibold">How this was validated</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {(confirmations.length > 0 ? confirmations : primaryConfirmation ? [primaryConfirmation] : []).map((confirmation) => {
              const confirmedAction = actionById(confirmation.actionId);
              return (
                <div key={confirmation.id} className="rounded-lg border border-ink/10 bg-paper p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{confirmedAction?.title ?? confirmation.actionId}</p>
                      <p className="mt-1 text-sm text-ink/62">
                        {confirmation.organizer} · {confirmation.confirmedAt} · {confirmation.pointsAwarded} pts
                      </p>
                    </div>
                    <span className="inline-flex min-h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-ink/62">
                      {confirmation.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/70">{confirmation.evidence}</p>
                  {confirmedAction && (
                    <div className="mt-3 grid gap-2 text-sm text-ink/66 md:grid-cols-3">
                      <EvidenceBox label="Beneficiary" value={confirmedAction.beneficiary} />
                      <EvidenceBox label="Impact claim" value={confirmedAction.impactClaim} />
                      <EvidenceBox label="Verification plan" value={confirmedAction.verificationPlan} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-5">
          <SocialInteractionPanel
            title="Affirm this achievement"
            targetType="achievement"
            targetId={params.badgeId}
            initialComments={comments}
          />
        </div>
      </div>
    </main>
  );
}

function BadgeSeal({ badge }: { badge: RewardBadge }) {
  return (
    <div className="relative mx-auto grid aspect-square w-32 place-items-center rounded-full border-4 border-white shadow-soft" style={{ backgroundColor: badge.accent }}>
      <div className="absolute inset-2 rounded-full border border-white/45" />
      <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-ink">
        <Trophy size={42} style={{ color: badge.accent }} />
      </div>
      <span className="absolute -bottom-2 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-paper">
        {badge.category}
      </span>
    </div>
  );
}

function CertificateMetric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <Icon size={20} className="text-tide" />
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="text-xs text-ink/58">{label}</p>
    </div>
  );
}

function SideFact({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-paper/12 bg-white/8 p-3">
      <Icon size={18} className="text-gold" />
      <p className="mt-2 font-semibold">{value}</p>
      <p className="text-xs text-paper/56">{label}</p>
    </div>
  );
}

function EvidenceBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function fallbackConfirmation(badgeId: string): OrganizerConfirmation | undefined {
  const mark = initialMarks.find((item) => item.badgeId === badgeId);
  const action = mark ? actionById(mark.eventId) : undefined;
  if (!mark || !action) return undefined;

  return {
    id: `achievement-${badgeId}`,
    actionId: action.id,
    organizer: action.organizer,
    status: action.confirmationStatus,
    pointsAwarded: mark.points,
    badgeId,
    evidence: `${mark.source === "Organizer confirmed" ? "World Enabler confirmed" : mark.source} record for ${mark.label}. ${action.verificationPlan}`,
    confirmedAt: badgeById(badgeId)?.earnedAt ?? "Modeled"
  };
}

function achievementNumber(seed: string) {
  const normalized = seed.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return `HP-${normalized.slice(0, 4)}-${normalized.slice(-6)}`;
}
