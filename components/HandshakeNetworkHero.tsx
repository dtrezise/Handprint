import { Handshake, Radio, Smartphone } from "lucide-react";

export function ShakeNetworkHero() {
  return (
    <>
      <div className="rounded-lg border border-ink/10 bg-white/108 p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="flex items-start gap-3">
            <Handshake className="mt-1 text-coral" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-coral">Shake</p>
              <h2 className="text-3xl font-semibold">Connect while you are together</h2>
              <p className="mt-2 max-w-3xl text-ink/70">
                Open Shake at an event, gently shake your phones, and add each other to a World Changing network built through real action.
              </p>
            </div>
          </div>
          <a
            href="handprint://shake"
            className="relative flex min-h-32 overflow-hidden rounded-md border border-tide/50 bg-tide/12 px-5 text-left transition hover:border-tide"
          >
            <span className="shake-listening-pulse" aria-hidden="true" />
            <span className="relative z-10 flex items-center gap-3 self-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-tide text-white">
                <Radio size={23} />
              </span>
              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-ink/48"><Smartphone size={15} /> iPhone nearby connection</span>
                <span className="mt-1 block text-lg font-semibold">Open Shake on iPhone</span>
                <span className="mt-1 block text-xs font-semibold text-ink/50">The app begins listening automatically</span>
              </span>
            </span>
          </a>
        </div>
      </div>

      <div className="rounded-lg border border-tide/25 bg-tide/10 p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <Handshake className="mt-1 text-tide" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tide">After the Shake</p>
            <h3 className="text-2xl font-semibold">Your World Changing Network</h3>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              Connections stay useful: see the people and World Enablers you met, what they are doing next, and where you can lend a hand together.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
