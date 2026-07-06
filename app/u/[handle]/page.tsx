import Link from "next/link";
import { ArrowRight, CalendarDays, Hand, MapPin, Share2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { HandprintVisual } from "@/components/HandprintVisual";
import { completedHighlights, initialMarks, nextJoinableActions, publicHandprintProfile } from "@/lib/handprint-data";

export function generateStaticParams() {
  return [{ handle: publicHandprintProfile.handle }];
}

export default function PublicHandprintPage({ params }: { params: { handle: string } }) {
  const handle = params.handle.toLowerCase();
  const isKnownProfile = handle === publicHandprintProfile.handle;
  const completed = completedHighlights();
  const nextActions = nextJoinableActions();

  if (!isKnownProfile) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-ink/10 bg-white/88 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Handprint</p>
          <h1 className="mt-2 text-3xl font-semibold">This handprint is not public yet.</h1>
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
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-semibold">
            Join in
            <ArrowRight size={16} />
          </Link>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-tide/10 px-3 text-sm font-semibold text-tide">
                <Share2 size={16} />
                @{publicHandprintProfile.handle}
              </span>
              <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-moss/10 px-3 text-sm font-semibold text-moss">
                <ShieldCheck size={16} />
                Verified participation
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {publicHandprintProfile.displayName}'s Handprint
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/72">{publicHandprintProfile.statement}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {publicHandprintProfile.highlights.map((highlight) => (
                <div key={highlight.label} className="rounded-lg border border-ink/10 bg-paper p-4">
                  <p className="text-2xl font-semibold">{highlight.value}</p>
                  <p className="mt-1 text-sm text-ink/62">{highlight.label}</p>
                </div>
              ))}
            </div>
          </div>

          <HandprintVisual marks={initialMarks} />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold" />
              <h2 className="text-2xl font-semibold">What this handprint has done</h2>
            </div>

            <div className="mt-4 grid gap-3">
              {completed.map(({ mark, action }) => (
                <div key={mark.id} className="rounded-lg border border-ink/10 bg-paper p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{mark.label}</p>
                      <p className="mt-1 text-sm text-ink/65">
                        {action?.organizer ?? "Verified organizer"} · {mark.category} · {mark.source}
                      </p>
                    </div>
                    <span className="inline-flex min-h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-ink/62">
                      weight {mark.weight}
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
                <PublicMetric icon={Users} label="Local pilot" value={publicHandprintProfile.locationLabel} />
              </div>
            </div>

            <div className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
              <h2 className="text-xl font-semibold">What Dan is doing next</h2>
              <div className="mt-4 grid gap-3">
                {nextActions.map((action) => (
                  <Link key={action.id} href="/" className="rounded-lg border border-ink/10 bg-paper p-4 transition hover:border-tide">
                    <p className="font-semibold">{action.title}</p>
                    <p className="mt-1 text-sm text-ink/62">
                      {action.startsAt} · {action.neighborhood}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tide">
                      Join this action
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
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
