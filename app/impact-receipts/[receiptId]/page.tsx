import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, ClipboardCheck, HandHeart, ShieldCheck, Users } from "lucide-react";
import { actionById } from "@/lib/handprint-data";
import { readImpactReceiptLedger } from "@/lib/server/impact-receipt-ledger";
import { findOrganizerByPublicId, readOrganizerLedger } from "@/lib/server/organizer-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImpactReceiptPage({ params }: { params: { receiptId: string } }) {
  const [receiptLedger, organizerLedger] = await Promise.all([readImpactReceiptLedger(), readOrganizerLedger()]);
  const receipt = receiptLedger.receipts.find((item) => item.id === params.receiptId);
  const organizer = receipt ? findOrganizerByPublicId(organizerLedger.profiles, receipt.organizerId) : undefined;
  const action = receipt ? actionById(receipt.eventId) : undefined;
  const nextAction = receipt?.nextInviteEventId ? actionById(receipt.nextInviteEventId) : undefined;

  if (!receipt || !organizer) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Impact receipt</p>
          <h1 className="mt-2 text-3xl font-semibold">Receipt not found.</h1>
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
        <Link href={`/organizations/${organizer.handle}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/68">
          <ArrowLeft size={16} />
          {organizer.name}
        </Link>

        <section className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
            <div className="p-6 sm:p-8">
              <div className="inline-flex min-h-9 items-center gap-2 rounded-full bg-moss/10 px-3 text-sm font-semibold text-ink">
                <HandHeart size={16} className="text-moss" />
                Impact receipt
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">{receipt.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/72">{receipt.accomplishment}</p>

              <div className="mt-6 rounded-lg border border-moss/25 bg-moss/10 p-5">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 shrink-0 text-moss" />
                  <div>
                    <p className="font-semibold">Confirmed accomplishment</p>
                    <p className="mt-1 text-sm leading-6 text-ink/70">{receipt.evidence}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <ReceiptFact icon={Users} label="Beneficiary" value={receipt.beneficiary} />
                <ReceiptFact icon={ShieldCheck} label="Confirmed by" value={receipt.confirmedBy} />
                <ReceiptFact icon={CalendarDays} label="Issued" value={receipt.issuedAt} />
              </div>
            </div>

            <aside className="grid content-between bg-ink p-6 text-paper sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">World Enabler</p>
                <p className="mt-2 text-2xl font-semibold">{organizer.name}</p>
                <p className="mt-2 text-sm leading-6 text-paper/70">{organizer.publicSummary}</p>
              </div>

              <div className="rounded-lg border border-paper/12 bg-white/8 p-4">
                <ClipboardCheck className="text-gold" />
                <p className="mt-2 text-sm leading-6 text-paper/74">
                  Impact receipts focus on what was accomplished, who affirmed it, and how someone can join the next useful action.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {nextAction && (
          <section className="mt-5 rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Keep the Handprint growing</p>
            <h2 className="mt-1 text-2xl font-semibold">{nextAction.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{nextAction.summary}</p>
            <Link href={`/?join=${nextAction.id}`} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-paper">
              Join next action
              <HandHeart size={16} />
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

function ReceiptFact({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <Icon size={20} className="text-tide" />
      <p className="mt-2 text-base font-semibold">{value}</p>
      <p className="text-xs text-ink/58">{label}</p>
    </div>
  );
}
