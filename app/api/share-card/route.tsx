import React from "react";
import { ImageResponse } from "next/og";
import { publicHandprintProfile } from "@/lib/handprint-data";

export const runtime = "edge";

const platformSizes: Record<string, { width: number; height: number; label: string }> = {
  facebook: { width: 1080, height: 1350, label: "Facebook Post" },
  "instagram-story": { width: 1080, height: 1920, label: "Instagram Story" },
  "instagram-reel": { width: 1080, height: 1920, label: "Instagram Reel" },
  linkedin: { width: 1200, height: 628, label: "LinkedIn Post" },
  tiktok: { width: 1080, height: 1920, label: "TikTok Reel" },
  messages: { width: 1080, height: 1080, label: "Messages Invite" }
};
const presetSizes: Record<string, { width: number; height: number; label: string; footer: string }> = {
  "phone-wallpaper": { width: 1170, height: 2532, label: "Phone Wallpaper", footer: "Save as a lock-screen scan card" },
  flyer: { width: 1200, height: 1800, label: "Flyer Insert", footer: "Post at signup, check-in, or invitation tables" },
  "badge-card": { width: 1024, height: 648, label: "Badge Card", footer: "Compact QR identity for quick scanning" },
  "social-square": { width: 1080, height: 1080, label: "Social Square", footer: "Shareable Handprint identity post" }
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const platform = url.searchParams.get("platform") ?? "instagram-story";
  const preset = url.searchParams.get("preset") ?? "";
  const format = url.searchParams.get("format") ?? "png";
  const template = url.searchParams.get("template") ?? "milestone";
  const message = url.searchParams.get("message") ?? publicHandprintProfile.inviteText;
  const presetCard = preset ? presetSizes[preset] : undefined;
  const platformCard = platformSizes[platform] ?? platformSizes["instagram-story"];
  const card = presetCard ?? platformCard;
  const fileName = `handprint-${preset || platform}-${template}`;
  const title = `${publicHandprintProfile.displayName}'s Handprint`;
  const subtitle = templateLabel(template);
  const fallbackUrl = "handprint.app/h/hp-dan";
  const surfaceLabel = presetCard ? `${presetCard.label} · ${platformCard.label}` : platformCard.label;
  const footer = presetCard?.footer ?? "Scan, follow, and join the next useful action";

  if (format === "svg") {
    return new Response(renderShareCardSvg({ width: card.width, height: card.height, platform: surfaceLabel, title, subtitle, message, fallbackUrl, footer }), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${fileName}.svg"`
      }
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: card.height > card.width ? 84 : 64,
          background: "linear-gradient(145deg, #0f211d 0%, #132b29 55%, #1f4e58 100%)",
          color: "#faf8f3",
          fontFamily: "Inter, Arial, sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 28, letterSpacing: 5, color: "#d8674c", fontWeight: 800 }}>HANDPRINT</div>
          <div style={{ fontSize: 24, color: "#e4b84f", fontWeight: 800 }}>{surfaceLabel}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: card.height > card.width ? 84 : 66, lineHeight: 1, fontWeight: 900 }}>{title}</div>
          <div style={{ fontSize: card.height > card.width ? 38 : 30, color: "#9fc7cf", fontWeight: 800 }}>{subtitle}</div>
          <div style={{ fontSize: card.height > card.width ? 46 : 34, lineHeight: 1.25, maxWidth: card.width * 0.78 }}>{message}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", gap: 18 }}>
            <Metric value="425" label="points" />
            <Metric value="4" label="badges" />
            <Metric value="Helper" label="rank" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{fallbackUrl}</div>
            <div style={{ fontSize: 18, color: "#c9d8d4", fontWeight: 700 }}>{footer}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: card.width,
      height: card.height,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}.png"`
      }
    }
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "18px 22px",
        border: "2px solid rgba(250,248,243,0.18)",
        borderRadius: 10,
        background: "rgba(250,248,243,0.08)"
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 900 }}>{value}</div>
      <div style={{ fontSize: 18, color: "#c9d8d4", fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function templateLabel(template: string) {
  if (template === "recruiting") return "Come do the next useful thing";
  if (template === "thanks") return "A thank-you for people who showed up";
  if (template === "impact") return "Verified contribution, visible impact";
  return "Milestone share";
}

function renderShareCardSvg({
  width,
  height,
  platform,
  title,
  subtitle,
  message,
  fallbackUrl,
  footer
}: {
  width: number;
  height: number;
  platform: string;
  title: string;
  subtitle: string;
  message: string;
  fallbackUrl: string;
  footer: string;
}) {
  const safeMessage = escapeXml(message);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#0f211d"/>
      <stop offset="0.58" stop-color="#132b29"/>
      <stop offset="1" stop-color="#1f4e58"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="64" y="88" fill="#d8674c" font-family="Arial" font-size="28" font-weight="800" letter-spacing="5">HANDPRINT</text>
  <text x="${width - 64}" y="88" fill="#e4b84f" font-family="Arial" font-size="24" font-weight="800" text-anchor="end">${escapeXml(platform)}</text>
  <text x="64" y="${height * 0.34}" fill="#faf8f3" font-family="Arial" font-size="${height > width ? 84 : 66}" font-weight="900">${escapeXml(title)}</text>
  <text x="64" y="${height * 0.34 + 58}" fill="#9fc7cf" font-family="Arial" font-size="${height > width ? 38 : 30}" font-weight="800">${escapeXml(subtitle)}</text>
  <foreignObject x="64" y="${height * 0.43}" width="${width * 0.78}" height="${height * 0.28}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:#faf8f3;font-family:Arial;font-size:${height > width ? 46 : 34}px;line-height:1.25;font-weight:700">${safeMessage}</div>
  </foreignObject>
  <rect x="64" y="${height - 170}" width="154" height="86" rx="10" fill="rgba(250,248,243,0.08)" stroke="rgba(250,248,243,0.18)" stroke-width="2"/>
  <text x="86" y="${height - 126}" fill="#faf8f3" font-family="Arial" font-size="34" font-weight="900">425</text>
  <text x="86" y="${height - 98}" fill="#c9d8d4" font-family="Arial" font-size="18" font-weight="700">points</text>
  <text x="${width - 64}" y="${height - 128}" fill="#faf8f3" font-family="Arial" font-size="26" font-weight="800" text-anchor="end">${escapeXml(fallbackUrl)}</text>
  <text x="${width - 64}" y="${height - 96}" fill="#c9d8d4" font-family="Arial" font-size="18" font-weight="700" text-anchor="end">${escapeXml(footer)}</text>
</svg>`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
