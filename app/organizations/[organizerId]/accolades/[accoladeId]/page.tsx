import Link from "next/link";
import { ArrowLeft, Award, BadgeCheck, ClipboardCheck, ShieldCheck, Trophy } from "lucide-react";
import { readOrganizerLedger } from "@/lib/server/organizer-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrganizerAccoladePage({ params }: { params: { organizerId: string; accoladeId: string } }) {
  const ledger = await readOrganizerLedger();
  const organizer = ledger.profiles.find((profile) => profile.handle === params.organizerId || profile.id === params.organizerId);
  const accolade = organizer?.accolades.find((item) => item.id === params.accoladeId);

  if (!organizer || !accolade) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">World Enabler accolade</p>
          <h1 className="mt-2 text-3xl font-semibold">Accolade not found.</h1>
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
          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: accolade.accent }} />
              <div className="inline-flex min-h-9 items-center gap-2 rounded-full bg-gold/12 px-3 text-sm font-semibold">
                <Award size={16} />
                World Enabler accolade
              </div>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-tide">{accolade.category}</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">{accolade.title}</h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-ink/70">{accolade.description}</p>

              <div className="mt-6 rounded-lg border border-ink/10 bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">This celebrates</p>
                <p className="mt-2 text-2xl font-semibold">{organizer.name}</p>
                <p className="mt-3 text-base leading-7 text-ink/72">{accolade.evidence}</p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Fact icon={BadgeCheck} label="Status" value={accolade.status.replaceAll("_", " ")} />
                <Fact icon={ClipboardCheck} label="Issued" value={accolade.issuedAt} />
                <Fact icon={Trophy} label="Trust tier" value={organizer.trustTier} />
              </div>

              {!!accolade.reviewHistory?.length && (
                <div className="mt-6 rounded-lg border border-moss/25 bg-moss/10 p-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-moss" />
                    <h2 className="text-xl font-semibold">Trust-review history</h2>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {accolade.reviewHistory.map((history) => (
                      <div key={history.id} className="rounded-md border border-ink/10 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
                          {history.createdAt} · {history.author}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-ink/70">{history.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="grid content-between bg-ink p-6 text-paper sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">World Enabler Handprint</p>
                <p className="mt-2 text-2xl font-semibold">{organizer.confirmedParticipants}</p>
                <p className="text-sm text-paper/64">confirmed participants mobilized</p>
                <div className="mt-5 rounded-lg border border-paper/12 bg-white/8 p-4">
                  <ShieldCheck className="text-gold" />
                  <p className="mt-2 text-sm leading-6 text-paper/74">
                    Accolades are evidence-backed recognition for World Enabler behavior. Sponsored visibility cannot buy this status.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof BadgeCheck; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <Icon size={20} className="text-tide" />
      <p className="mt-2 text-lg font-semibold capitalize">{value}</p>
      <p className="text-xs text-ink/58">{label}</p>
    </div>
  );
}
