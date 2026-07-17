import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { resetHandprintDatabaseCache } from "../lib/server/database";
import {
  applySocialLedgerPatch,
  createModerationReview,
  readModerationReviewQueue,
  readPublicCommentCounts,
  readPublicComments,
  readSocialLedger
} from "../lib/server/social-ledger";

const session = {
  id: "session-social-test",
  displayName: "Dan"
};

test("affirmation review rewrites attacks and escalates severe language", () => {
  const rewrite = createModerationReview(session.id, "share_caption", "These idiots never help anyone.");
  assert.equal(rewrite.status, "rewrite");
  assert.ok(rewrite.issues.includes("Personal attack or mocking language"));
  assert.match(rewrite.suggestion, /focus less on blame/);

  const escalated = createModerationReview(session.id, "comment", "This is a threat and should be violent.");
  assert.equal(escalated.status, "escalated");
  assert.ok(escalated.issues.includes("Severe language needs human review before it can publish."));
});

test("social ledger persists drafts, history, comments, messages, reports, and controls", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "handprint-social-db-"));
  process.env.HANDPRINT_DB_PATH = path.join(tempDir, "handprint.sqlite");
  resetHandprintDatabaseCache();

  try {
    applySocialLedgerPatch(session, {
      action: "save_share_draft",
      platformId: "instagram-story",
      message: "I am helping with pantry packing. Come join the next useful action.",
      templateId: "recruiting",
      selectedAchievementId: "mark-food-shelf",
      selectedActionId: "meals-on-wheels-route",
      hashtags: ["#Handprint", "#DoSomething"]
    });
    applySocialLedgerPatch(session, {
      action: "record_share_history",
      platformId: "instagram-story",
      preparedText: "Prepared Handprint share",
      status: "shared",
      selectedAchievementId: "mark-food-shelf",
      selectedActionId: "meals-on-wheels-route"
    });
    const commentResult = applySocialLedgerPatch(session, {
      action: "create_comment",
      targetType: "achievement",
      targetId: "badge-pantry-builder",
      text: "Thank you for making this useful. I can help pack next week."
    }) as { comment: { id: string } };
    const messageResult = applySocialLedgerPatch(session, {
      action: "create_message",
      recipientType: "world_enabler",
      recipientId: "ccap-loaves-fishes",
      messageType: "recruitment",
      text: "I can invite two neighbors to help with the next shift."
    }) as { message: { id: string } };
    const reportResult = applySocialLedgerPatch(session, {
      action: "report_content",
      contentType: "comment",
      contentId: commentResult.comment.id,
      reason: "Tone or safety review",
      note: "Test report"
    }) as { report: { id: string; status: string } };
    applySocialLedgerPatch(session, {
      action: "account_control",
      targetId: "ccap-loaves-fishes",
      control: "muted",
      enabled: true
    });

    const ledger = readSocialLedger(session);
    assert.equal(ledger.drafts[0].platformId, "instagram-story");
    assert.equal(ledger.drafts[0].templateId, "recruiting");
    assert.equal(ledger.preferences.messageRequestPolicy, "followed_network");
    assert.equal(ledger.preferences.externalShareReviewRequired, true);
    assert.equal(ledger.history[0].preparedText, "Prepared Handprint share");
    assert.equal(ledger.history[0].status, "shared");
    assert.equal(ledger.comments[0].id, commentResult.comment.id);
    assert.equal(ledger.messages[0].id, messageResult.message.id);
    assert.equal(ledger.reports[0].contentId, commentResult.comment.id);
    assert.equal(ledger.accountControls[0].control, "muted");
    assert.ok(ledger.moderationReviews.length >= 3);
    assert.ok(ledger.notifications.some((notification) => notification.unread));

    applySocialLedgerPatch(session, {
      action: "mark_notifications_read"
    });
    const readLedger = readSocialLedger(session);
    assert.equal(readLedger.notifications.filter((notification) => notification.unread).length, 0);

    const comments = readPublicComments("achievement", "badge-pantry-builder");
    assert.equal(comments[0].id, commentResult.comment.id);
    const counts = readPublicCommentCounts([{ targetType: "achievement", targetId: "badge-pantry-builder" }]);
    assert.equal(counts["achievement:badge-pantry-builder"], 1);

    const queue = readModerationReviewQueue();
    assert.ok(queue.reviews.length >= 0);

    const flagged = applySocialLedgerPatch(session, {
      action: "moderation_review",
      surface: "comment",
      text: "These idiots never help."
    }) as { review: { id: string; status: string } };
    assert.equal(flagged.review.status, "rewrite");
    const decision = applySocialLedgerPatch(session, {
      action: "review_moderation",
      reviewId: flagged.review.id,
      decision: "approved",
      reviewerNote: "Accepted after review."
    }) as { review: { status: string } };
    assert.equal(decision.review.status, "ready");

    const reviewingReport = applySocialLedgerPatch(session, {
      action: "resolve_report",
      reportId: reportResult.report.id,
      status: "reviewing",
      resolutionNote: "Reviewer opened the report."
    }) as { report: { status: string; resolutionNote?: string } };
    assert.equal(reviewingReport.report.status, "reviewing");
    assert.equal(reviewingReport.report.resolutionNote, "Reviewer opened the report.");

    const resolvedReport = applySocialLedgerPatch(session, {
      action: "resolve_report",
      reportId: reportResult.report.id,
      status: "resolved",
      resolutionNote: "No action needed."
    }) as { report: { status: string; resolvedAt?: string } };
    assert.equal(resolvedReport.report.status, "resolved");
    assert.ok(resolvedReport.report.resolvedAt);
  } finally {
    resetHandprintDatabaseCache();
    delete process.env.HANDPRINT_DB_PATH;
    rmSync(tempDir, { recursive: true, force: true });
  }
});
