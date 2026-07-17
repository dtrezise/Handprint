"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode, RotateCcw, ShieldCheck } from "lucide-react";

type QrCodeCardProps = {
  title: string;
  publicUrl: string;
  fallbackUrl: string;
  tier: string;
  points: number;
  enabled: boolean;
  rotatedAt: string;
  designNote?: string;
  compact?: boolean;
};

export function QrCodeCard({
  title,
  publicUrl,
  fallbackUrl,
  tier,
  points,
  enabled,
  rotatedAt,
  designNote,
  compact = false
}: QrCodeCardProps) {
  const [svg, setSvg] = useState("");
  const [pngUrl, setPngUrl] = useState("");
  const qrOptions = useMemo(
    () => ({
      errorCorrectionLevel: "H" as const,
      margin: 2,
      width: compact ? 184 : 248,
      color: {
        dark: "#24211d",
        light: "#ffffff"
      }
    }),
    [compact]
  );

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(publicUrl, { ...qrOptions, type: "svg" }).then((nextSvg) => {
      if (isMounted) setSvg(nextSvg);
    });
    QRCode.toDataURL(publicUrl, { ...qrOptions, width: 1200 }).then((nextPngUrl) => {
      if (isMounted) setPngUrl(nextPngUrl);
    });
    return () => {
      isMounted = false;
    };
  }, [publicUrl, qrOptions]);

  const downloadSvg = () => {
    if (!svg) return;
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "handprint-qr-card.svg");
  };

  const downloadPng = () => {
    if (!pngUrl) return;
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "handprint-qr-card.png";
    link.click();
  };

  return (
    <section className="rounded-lg border border-ink/10 bg-white/88 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tide">Scan my Handprint</p>
          <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ink text-paper">
          <QrCode size={22} />
        </span>
      </div>

      <div className="mt-4 grid place-items-center rounded-lg border border-ink/10 bg-paper p-3">
        {enabled && svg ? (
          <div
            aria-label={`QR code for ${publicUrl}`}
            className="rounded-md bg-white p-2 shadow-sm [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="grid aspect-square w-full max-w-[248px] place-items-center rounded-md bg-ink/8 text-center text-sm font-semibold text-ink/55">
            QR disabled
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-gold/12 p-3">
          <p className="text-lg font-semibold">{tier}</p>
          <p className="text-xs text-ink/60">World Changer tier</p>
        </div>
        <div className="rounded-md bg-tide/10 p-3">
          <p className="text-lg font-semibold">{points}</p>
          <p className="text-xs text-ink/60">verified points</p>
        </div>
      </div>

      <p className="mt-3 break-all rounded-md border border-ink/10 bg-paper p-2 text-xs font-semibold text-ink/70">{fallbackUrl}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-moss/10 px-2.5 text-xs font-semibold text-moss">
          <ShieldCheck size={13} />
          reliable QR
        </span>
        <span className="inline-flex min-h-8 items-center gap-1 rounded-full bg-ink/6 px-2.5 text-xs font-semibold text-ink/62">
          <RotateCcw size={13} />
          rotated {rotatedAt}
        </span>
      </div>

      {!compact && designNote && <p className="mt-3 text-xs leading-5 text-ink/55">{designNote}</p>}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={downloadPng} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper">
          <Download size={16} />
          PNG
        </button>
        <button type="button" onClick={downloadSvg} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-ink/12 bg-white px-3 text-sm font-semibold">
          <Download size={16} />
          SVG
        </button>
      </div>
    </section>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
