import Link from "next/link";
import { ArrowLeft, Award, CalendarDays, ClipboardCheck, ShieldCheck, Users } from "lucide-react";
import { actionById } from "@/lib/handprint-data";
import { readImpactReceiptLedger } from "@/lib/server/impact-receipt-ledger";
import { findOrganizerByPublicId, readOrganizerLedger } from "@/lib/server/organizer-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GrantReportPage({ params }: { params: { organizerId: string } }) {
  const [organizerLedger, receiptLedger] = await Promise.all([readOrganizerLedger(), readImpactReceiptLedger()]);
  const organizer = findOrganizerByPublicId(organizerLedger.profiles, params.organizerId);

  if (!organizer) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Grant report</p>
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

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/organizations/${organizer.handle}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/68">
          <ArrowLeft size={16} />
          {organizer.name}
        </Link>

        <section className="mt-4 rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">Grant-ready preview</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">{organizer.name} World Enabler record</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-ink/72">{organizer.grantReadySummary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <ReportMetric icon={CalendarDays} label="Events hosted" value={String(organizer.eventsHosted)} />
            <ReportMetric icon={Users} label="Confirmed participants" value={String(organizer.confirmedParticipants)} />
            <ReportMetric icon={ClipboardCheck} label="Volunteer hours" value={String(organizer.volunteerHours)} />
            <ReportMetric icon={Award} label="Approved accolades" value={String(approvedAccolades.length)} />
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-moss" />
              <h2 className="text-2xl font-semibold">Evidence summary</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {organizer.impactReceiptIds.map((receiptId) => {
                const receipt = receiptLedger.receipts.find((item) => item.id === receiptId);
                if (!receipt) return null;
                const action = actionById(receipt.eventId);
                return (
                  <Link key={receiptId} href={`/impact-receipts/${receiptId}`} className="rounded-md border border-ink/10 bg-paper p-4">
                    <p className="font-semibold">{receipt.title}</p>
                    <p className="mt-1 text-sm text-ink/62">{action?.organizer ?? organizer.name} · {receipt.issuedAt}</p>
                    <p className="mt-2 text-sm leading-6 text-ink/70">{receipt.accomplishment}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Award className="text-gold" />
              <h2 className="text-2xl font-semibold">Accolades</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {approvedAccolades.map((accolade) => (
                <Link key={accolade.id} href={`/organizations/${organizer.handle}/accolades/${accolade.id}`} className="rounded-md border border-ink/10 bg-paper p-4">
                  <p className="font-semibold">{accolade.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/66">{accolade.evidence}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ReportMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <Icon size={20} className="text-tide" />
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="text-sm text-ink/58">{label}</p>
    </div>
  );
}
