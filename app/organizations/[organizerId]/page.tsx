import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, ClipboardCheck, ExternalLink, ShieldCheck, Trophy, Users } from "lucide-react";
import { SocialInteractionPanel } from "@/components/SocialInteractionPanel";
import { actionById } from "@/lib/handprint-data";
import { readImpactReceiptLedger } from "@/lib/server/impact-receipt-ledger";
import { findOrganizerByPublicId, readOrganizerLedger } from "@/lib/server/organizer-ledger";
import { readPublicComments } from "@/lib/server/social-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrganizationPage({ params }: { params: { organizerId: string } }) {
  const [organizerLedger, receiptLedger] = await Promise.all([readOrganizerLedger(), readImpactReceiptLedger()]);
  const organizer = findOrganizerByPublicId(organizerLedger.profiles, params.organizerId);

  if (!organizer) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">World Enabler</p>
          <h1 className="mt-2 text-3xl font-semibold">World Enabler not found.</h1>
          <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 font-semibold text-paper">
            <ArrowLeft size={18} />
            Back to Handprint
          </Link>
        </div>
      </main>
    );
  }

  const approvedAccolades = organizer.accolades.filter((accolade) => accolade.status === "approved");
  const comments = readPublicComments("world_enabler", organizer.id);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/68">
          <ArrowLeft size={16} />
          Handprint
        </Link>

        <section className="mt-4 rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">{organizer.trustTier}</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{organizer.name}</h1>
              <p className="mt-2 text-lg font-semibold text-ink/55">{organizer.type}</p>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/72">{organizer.publicSummary}</p>
            </div>
            <div className="rounded-lg bg-ink p-4 text-paper">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">World Enabler Handprint</p>
              <p className="mt-2 text-3xl font-semibold">{organizer.confirmedParticipants}</p>
              <p className="text-sm text-paper/68">confirmed participants mobilized</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <PublicMetric icon={Users} label="Attendees mobilized" value={String(organizer.attendeesMobilized)} />
            <PublicMetric icon={ClipboardCheck} label="Volunteer hours" value={String(organizer.volunteerHours)} />
            <PublicMetric icon={Trophy} label="Points issued" value={String(organizer.handprintPointsIssued)} />
            <PublicMetric icon={Award} label="Accolades" value={String(approvedAccolades.length)} />
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-moss" />
                <h2 className="text-2xl font-semibold">Impact highlights</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {organizer.impactHighlights.map((highlight) => (
                  <div key={highlight.label} className="rounded-md border border-ink/10 bg-paper p-3">
                    <p className="text-2xl font-semibold">{highlight.value}</p>
                    <p className="text-sm text-ink/60">{highlight.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <Award className="text-gold" />
                <h2 className="text-2xl font-semibold">Accolades</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {organizer.accolades.map((accolade) => (
                  <Link key={accolade.id} href={`/organizations/${organizer.handle}/accolades/${accolade.id}`} className="rounded-md border border-ink/10 bg-paper p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{accolade.category}</p>
                    <p className="mt-1 font-semibold">{accolade.title}</p>
                    <p className="mt-1 text-sm leading-6 text-ink/66">{accolade.description}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tide">
                      View evidence
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-lg border border-gold/30 bg-gold/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/55">Grant-ready proof</p>
              <p className="mt-2 text-sm leading-6 text-ink/72">{organizer.grantReadySummary}</p>
              <Link href={`/organizations/${organizer.handle}/grant-report`} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
                Preview report
                <ExternalLink size={15} />
              </Link>
            </div>

            <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">Impact receipts</p>
              <div className="mt-3 grid gap-2">
                {organizer.impactReceiptIds.map((receiptId) => {
                  const receipt = receiptLedger.receipts.find((item) => item.id === receiptId);
                  if (!receipt) return null;
                  const action = actionById(receipt.eventId);
                  return (
                    <Link key={receiptId} href={`/impact-receipts/${receiptId}`} className="rounded-md bg-paper p-3">
                      <p className="font-semibold">{receipt.title}</p>
                      <p className="mt-1 text-sm text-ink/62">{action?.category ?? "Impact"} · {receipt.issuedAt}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-moss/25 bg-moss/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Invite me to help</p>
            <h2 className="mt-2 text-2xl font-semibold">Ask this World Enabler where you can be useful next.</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              V1 routes this through the Affirmation Agent so requests stay specific, constructive, and aligned with useful action.
            </p>
          </div>
          <div className="rounded-lg border border-tide/25 bg-tide/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tide">Recruiting path</p>
            <h2 className="mt-2 text-2xl font-semibold">World Enablers can invite World Changers back.</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Messages can become event invites, leadership asks, training suggestions, or follow-up confirmations as the inbox matures.
            </p>
          </div>
        </section>

        <div className="mt-5">
          <SocialInteractionPanel
            title="Affirm this World Enabler"
            targetType="world_enabler"
            targetId={organizer.id}
            initialComments={comments}
            allowAccountControls
          />
        </div>
      </div>
    </main>
  );
}

function PublicMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <Icon size={20} className="text-tide" />
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="text-sm text-ink/58">{label}</p>
    </div>
  );
}
