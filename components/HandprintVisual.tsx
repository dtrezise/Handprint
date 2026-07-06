"use client";

import type { HandprintMark } from "@/lib/handprint-data";

const baseLines = [
  "M118 238 C94 205 82 168 87 131 C91 103 103 80 122 65",
  "M143 224 C137 180 138 128 145 83 C149 58 158 39 171 30",
  "M174 220 C181 172 194 119 212 72 C224 42 238 22 254 16",
  "M204 232 C226 191 253 149 286 113 C306 91 325 80 342 80",
  "M228 257 C266 233 302 213 337 197 C364 185 386 183 402 193",
  "M115 239 C126 281 148 314 184 337 C219 360 259 363 293 344",
  "M99 169 C71 185 56 207 56 235 C56 279 89 311 128 318",
  "M292 344 C328 318 343 286 336 249 C332 229 321 213 304 201"
];

const markPaths = [
  "M108 228 C142 217 184 216 226 229",
  "M121 267 C161 251 205 250 256 267",
  "M143 301 C179 289 216 291 250 309",
  "M151 194 C168 181 190 175 219 178",
  "M181 146 C203 141 229 146 252 162",
  "M225 112 C244 116 263 127 279 145",
  "M268 206 C291 214 308 230 316 252",
  "M91 196 C105 188 122 185 142 189"
];

const colorByCategory: Record<string, string> = {
  "Food support": "#d8674c",
  Cleanup: "#4f6f52",
  Mentoring: "#6f4d7c",
  "Mutual aid": "#1f7a8c",
  "Civic forum": "#c99a35",
  "Arts community": "#d8674c",
  Preparedness: "#4f6f52"
};

export function HandprintVisual({ marks, activeEventId }: { marks: HandprintMark[]; activeEventId?: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-ink/10 bg-white/78 p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tide">Your Handprint</p>
          <h2 className="text-xl font-semibold text-ink">Visible impact identity</h2>
        </div>
        <div className="rounded-full border border-ink/10 px-3 py-1 text-sm font-semibold">
          {marks.length} marks
        </div>
      </div>

      <svg
        viewBox="0 0 460 380"
        role="img"
        aria-label="A handprint that gains colored lines as participation grows"
        className="aspect-[1.2/1] w-full"
      >
        <rect width="460" height="380" rx="18" fill="#faf8f3" />
        {baseLines.map((path) => (
          <path key={path} d={path} fill="none" stroke="#171717" strokeOpacity="0.28" strokeWidth="11" className="hand-line" />
        ))}
        {marks.map((mark, index) => {
          const isActive = activeEventId === mark.eventId;
          return (
            <path
              key={mark.id}
              d={markPaths[index % markPaths.length]}
              fill="none"
              stroke={colorByCategory[mark.category]}
              strokeWidth={isActive ? 12 : 8 + mark.weight}
              strokeOpacity={isActive ? 1 : 0.78}
              className="hand-line transition-all"
            />
          );
        })}
        <circle cx="334" cy="92" r="22" fill="#1f7a8c" opacity="0.15" />
        <circle cx="87" cy="265" r="18" fill="#d8674c" opacity="0.14" />
      </svg>

      <div className="mt-3 grid gap-2">
        {marks.slice(-4).map((mark) => (
          <div key={mark.id} className="flex items-center justify-between rounded-md border border-ink/10 bg-white px-3 py-2">
            <div className="min-w-0">
              <span className="block truncate text-sm font-medium">{mark.label}</span>
              <span className="text-xs text-ink/55">{mark.source}</span>
            </div>
            <span className="shrink-0 text-xs text-ink/60">{mark.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
