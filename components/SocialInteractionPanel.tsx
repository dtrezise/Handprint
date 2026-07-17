"use client";

import { useState, type CSSProperties } from "react";
import { Flag, Hand, MessageCircle, ShieldAlert, UserX } from "lucide-react";
import type { SocialComment, SocialTargetType } from "@/lib/server/social-ledger";

export function SocialInteractionPanel({
  title,
  targetType,
  targetId,
  initialComments,
  allowAccountControls = false
}: {
  title: string;
  targetType: SocialTargetType;
  targetId: string;
  initialComments: SocialComment[];
  allowAccountControls?: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("Thank you for making this useful. I want to help with the next action.");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [highFiveBurst, setHighFiveBurst] = useState(false);
  const [sortMode, setSortMode] = useState<"newest" | "ready" | "needs_review">("newest");
  const sortedComments = [...comments].sort((a, b) => {
    if (sortMode === "ready") return Number(b.status === "sent") - Number(a.status === "sent") || b.createdAt.localeCompare(a.createdAt);
    if (sortMode === "needs_review") return Number(b.status !== "sent") - Number(a.status !== "sent") || b.createdAt.localeCompare(a.createdAt);
    return b.createdAt.localeCompare(a.createdAt);
  });

  const submitComment = async () => {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_comment", targetType, targetId, text: draft })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Comment failed");
      if (payload.comment) setComments((current) => [payload.comment, ...current]);
      setStatus(payload.review?.status === "ready" ? "Posted" : "Rewrite or review suggested");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Comment failed");
    } finally {
      setBusy(false);
    }
  };

  const reportComment = async (commentId: string) => {
    await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "report_content",
        contentType: "comment",
        contentId: commentId,
        reason: "Tone or safety review",
        note: `Reported from ${targetType}:${targetId}`
      })
    });
    setStatus("Report queued");
  };

  const setControl = async (control: "muted" | "blocked", enabled: boolean) => {
    await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "account_control", targetId, control, enabled, note: `Set from ${targetType} page` })
    });
    if (control === "muted") setMuted(enabled);
    if (control === "blocked") setBlocked(enabled);
    setStatus(`${control} ${enabled ? "enabled" : "cleared"}`);
  };

  const giveHighFive = async () => {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_comment", targetType, targetId, text: "Hi-five for this achievement." })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Hi-five failed");
      if (payload.comment) setComments((current) => [payload.comment, ...current]);
      setHighFiveBurst(false);
      window.requestAnimationFrame(() => setHighFiveBurst(true));
      window.setTimeout(() => setHighFiveBurst(false), 1100);
      setStatus("Hi-five sent");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Hi-five failed");
    } finally {
      setBusy(false);
    }
  };

  const highFiveCount = comments.filter((comment) => comment.approvedText.toLowerCase().startsWith("hi-five")).length;

  return (
    <section className="rounded-lg border border-ink/10 bg-white/88 p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="text-tide" />
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink/66">
            Comments are checked by the Affirmation Agent before they become part of this Handprint record.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-tide">
            {comments.length} public {comments.length === 1 ? "affirmation" : "affirmations"}
          </p>
        </div>
        {allowAccountControls && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void setControl("muted", !muted)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                muted ? "bg-gold text-ink" : "border border-ink/12 bg-paper text-ink/68"
              }`}
            >
              <ShieldAlert size={16} />
              {muted ? "Muted" : "Mute"}
            </button>
            <button
              type="button"
              onClick={() => void setControl("blocked", !blocked)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                blocked ? "bg-coral text-white" : "border border-ink/12 bg-paper text-ink/68"
              }`}
            >
              <UserX size={16} />
              {blocked ? "Blocked" : "Block"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        {targetType === "achievement" && (
          <button
            type="button"
            onClick={() => void giveHighFive()}
            disabled={busy || blocked}
            className="hi-five-button relative inline-flex min-h-12 items-center justify-center gap-2 overflow-visible rounded-md bg-gold px-5 text-sm font-semibold text-ink disabled:opacity-50 sm:w-fit"
          >
            <Hand size={19} />
            Hi-Five this achievement
            <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">{highFiveCount}</span>
            {highFiveBurst && (
              <span className="hi-five-burst" aria-hidden="true">
                {Array.from({ length: 10 }, (_, index) => <i key={index} style={{ "--burst-index": index } as CSSProperties} />)}
              </span>
            )}
          </button>
        )}
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={blocked}
          className="min-h-24 resize-y rounded-md border border-ink/10 bg-paper px-3 py-2 text-sm leading-6 outline-none transition focus:border-tide disabled:cursor-not-allowed disabled:text-ink/40"
        />
        <button
          type="button"
          onClick={() => void submitComment()}
          disabled={busy || blocked}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-moss px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/45 sm:w-fit"
        >
          <MessageCircle size={17} />
          {busy ? "Checking" : "Post affirming comment"}
        </button>
        {status && <p className="text-sm font-semibold text-ink/62">{status}</p>}
      </div>

      <div className="mt-5 grid gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">Public affirmations</p>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
            className="min-h-9 rounded-md border border-ink/12 bg-paper px-3 text-sm font-semibold outline-none"
          >
            <option value="newest">Newest</option>
            <option value="ready">Ready first</option>
            <option value="needs_review">Needs review first</option>
          </select>
        </div>
        {comments.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink/12 bg-paper p-4 text-sm font-semibold text-ink/50">
            No public comments yet.
          </div>
        ) : (
          sortedComments.map((comment) => (
            <article key={comment.id} className="rounded-md border border-ink/10 bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{comment.authorName}</p>
                  <p className="mt-1 text-sm leading-6 text-ink/72">{comment.approvedText}</p>
                  <p className="mt-2 text-xs font-semibold text-ink/45">{comment.status.replaceAll("_", " ")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void reportComment(comment.id)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-ink/12 bg-white/60 px-2 py-1.5 text-xs font-semibold text-ink/58"
                >
                  <Flag size={13} />
                  Report
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
