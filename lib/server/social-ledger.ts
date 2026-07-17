import { publicHandprintProfile } from "@/lib/handprint-data";
import { getHandprintDatabase, parseJson, stringifyJson } from "@/lib/server/database";
import type { HandprintSession } from "@/lib/server/session";

export type ShareSurface = "share_caption" | "comment" | "message" | "recruitment" | "event_update";
export type ModerationStatus = "ready" | "rewrite" | "escalated";
export type SocialContentStatus = "ready" | "rewrite_suggested" | "sent" | "reported" | "escalated";
export type SocialReviewDecision = "approved" | "rewrite" | "hold";
export type SocialReportResolution = "resolved" | "reviewing";
export type SocialTargetType = "achievement" | "public_profile" | "world_enabler" | "event";
export type SocialRecipientType = "world_changer" | "world_enabler";
export type AccountControlKind = "muted" | "blocked";

export type SocialModerationReview = {
  id: string;
  userId: string;
  surface: ShareSurface;
  sourceText: string;
  status: ModerationStatus;
  issues: string[];
  suggestion: string;
  confidence: number;
  reviewerNote?: string;
  reviewerDecision?: SocialReviewDecision;
  reviewedAt?: string;
  createdAt: string;
};

export type ShareDraft = {
  id: string;
  userId: string;
  platformId: string;
  message: string;
  templateId?: string;
  selectedAchievementId?: string;
  selectedActionId?: string;
  hashtags: string[];
  moderationReviewId?: string;
  updatedAt: string;
};

export type ShareHistoryItem = {
  id: string;
  userId: string;
  platformId: string;
  preparedText: string;
  status: "prepared" | "shared" | "reported";
  selectedAchievementId?: string;
  selectedActionId?: string;
  createdAt: string;
};

export type ShareTemplate = {
  id: string;
  userId: string;
  label: string;
  message: string;
  platformId?: string;
  updatedAt: string;
};

export type SocialComment = {
  id: string;
  userId: string;
  authorName: string;
  targetType: SocialTargetType;
  targetId: string;
  text: string;
  approvedText: string;
  moderationReviewId: string;
  status: SocialContentStatus;
  createdAt: string;
};

export type SocialMessage = {
  id: string;
  userId: string;
  authorName: string;
  recipientType: SocialRecipientType;
  recipientId: string;
  messageType: "private_request" | "recruitment" | "event_update";
  text: string;
  approvedText: string;
  moderationReviewId: string;
  status: SocialContentStatus;
  createdAt: string;
};

export type SocialReport = {
  id: string;
  userId: string;
  contentType: "comment" | "message" | "share";
  contentId: string;
  reason: string;
  note: string;
  status: "queued" | "reviewing" | "resolved";
  resolutionNote?: string;
  resolvedAt?: string;
  createdAt: string;
};

export type SocialAccountControl = {
  userId: string;
  targetId: string;
  control: AccountControlKind;
  note?: string;
  updatedAt: string;
};

export type SocialNotification = {
  id: string;
  type: "comment" | "message" | "review" | "report" | "share" | "follow";
  title: string;
  detail: string;
  targetId?: string;
  unread: boolean;
  createdAt: string;
};

export type SocialPreferences = {
  notifyComments: boolean;
  notifyMessages: boolean;
  notifyReviews: boolean;
  notifyReports: boolean;
  quietMode: boolean;
  messageRequestPolicy: "everyone" | "followed_network" | "event_network";
  externalShareReviewRequired: boolean;
};

export type SocialLedger = {
  templates: ShareTemplate[];
  drafts: ShareDraft[];
  history: ShareHistoryItem[];
  moderationReviews: SocialModerationReview[];
  comments: SocialComment[];
  messages: SocialMessage[];
  reports: SocialReport[];
  accountControls: SocialAccountControl[];
  preferences: SocialPreferences;
  notifications: SocialNotification[];
};

export type SocialLedgerPatch =
  | {
      action: "moderation_review";
      surface: ShareSurface;
      text: string;
    }
  | {
      action: "save_share_draft";
      platformId: string;
      message: string;
      templateId?: string;
      selectedAchievementId?: string;
      selectedActionId?: string;
      hashtags?: string[];
    }
  | {
      action: "record_share_history";
      platformId: string;
      preparedText: string;
      status?: ShareHistoryItem["status"];
      selectedAchievementId?: string;
      selectedActionId?: string;
    }
  | {
      action: "save_share_template";
      templateId?: string;
      label: string;
      message: string;
      platformId?: string;
    }
  | {
      action: "delete_share_template";
      templateId: string;
    }
  | {
      action: "create_comment";
      targetType: SocialTargetType;
      targetId: string;
      text: string;
    }
  | {
      action: "create_message";
      recipientType: SocialRecipientType;
      recipientId: string;
      messageType: SocialMessage["messageType"];
      text: string;
    }
  | {
      action: "report_content";
      contentType: SocialReport["contentType"];
      contentId: string;
      reason: string;
      note?: string;
    }
  | {
      action: "account_control";
      targetId: string;
      control: AccountControlKind;
      enabled: boolean;
      note?: string;
    }
  | {
      action: "review_moderation";
      reviewId: string;
      decision: SocialReviewDecision;
      reviewerNote?: string;
    }
  | {
      action: "resolve_report";
      reportId: string;
      status: SocialReportResolution;
      resolutionNote?: string;
    }
  | {
      action: "update_preferences";
      preferences: Partial<SocialPreferences>;
    }
  | {
      action: "mark_notifications_read";
      notificationIds?: string[];
    };

const defaultSocialPreferences: SocialPreferences = {
  notifyComments: true,
  notifyMessages: true,
  notifyReviews: true,
  notifyReports: true,
  quietMode: false,
  messageRequestPolicy: "followed_network",
  externalShareReviewRequired: true
};

const defaultShareMessage = `I am growing my Handprint through useful action around ${publicHandprintProfile.locationLabel}. ${publicHandprintProfile.inviteText}`;
const discouragingLanguageRules = [
  {
    pattern: /\b(idiot|idiots|stupid|moron|loser|trash|worthless|clown|shut up)\b/i,
    issue: "Personal attack or mocking language"
  },
  {
    pattern: /\b(hate|destroy|crush|humiliate|ruin them|make them pay)\b/i,
    issue: "Escalating or punitive language"
  },
  {
    pattern: /\b(always|never)\b.*\b(they|them|you people)\b/i,
    issue: "Broad blame that can turn a concern into a pile-on"
  }
];
const severeLanguagePattern = /\b(kill|violent|violence|dox|doxx|threat|threaten)\b/i;

export function readSocialLedger(session: Pick<HandprintSession, "id">): SocialLedger {
  const db = getHandprintDatabase();
  const userId = session.id;
  const templates = (
    db.prepare("SELECT payload FROM share_templates WHERE user_id = ? ORDER BY updated_at DESC").all(userId) as { payload: string }[]
  ).map((row) => parseJson<ShareTemplate>(row.payload));
  const drafts = (
    db.prepare("SELECT payload FROM share_drafts WHERE user_id = ? ORDER BY updated_at DESC").all(userId) as { payload: string }[]
  ).map((row) => parseJson<ShareDraft>(row.payload));
  const history = (
    db.prepare("SELECT payload FROM share_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20").all(userId) as { payload: string }[]
  ).map((row) => normalizeShareHistoryItem(parseJson<ShareHistoryItem>(row.payload)));
  const moderationReviews = (
    db.prepare("SELECT payload FROM moderation_reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 30").all(userId) as { payload: string }[]
  ).map((row) => normalizeModerationReview(parseJson<SocialModerationReview>(row.payload)));
  const comments = (
    db.prepare("SELECT payload FROM social_comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 30").all(userId) as { payload: string }[]
  ).map((row) => parseJson<SocialComment>(row.payload));
  const messages = (
    db.prepare("SELECT payload FROM social_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 30").all(userId) as { payload: string }[]
  ).map((row) => parseJson<SocialMessage>(row.payload));
  const reports = (
    db.prepare("SELECT payload FROM social_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 30").all(userId) as { payload: string }[]
  ).map((row) => parseJson<SocialReport>(row.payload));
  const accountControls = (
    db.prepare("SELECT payload FROM social_account_controls WHERE user_id = ? ORDER BY updated_at DESC").all(userId) as { payload: string }[]
  ).map((row) => parseJson<SocialAccountControl>(row.payload));
  const preferences = readSocialPreferences(userId);
  const readNotificationIds = readSocialNotificationReads(userId);

  return {
    templates,
    drafts,
    history,
    moderationReviews,
    comments,
    messages,
    reports,
    accountControls,
    preferences,
    notifications: deriveNotifications({ history, moderationReviews, comments, messages, reports }, preferences, readNotificationIds)
  };
}

export function applySocialLedgerPatch(session: Pick<HandprintSession, "id" | "displayName">, patch: SocialLedgerPatch) {
  const db = getHandprintDatabase();
  const now = new Date().toISOString();
  const userId = session.id;

  if (patch.action === "moderation_review") {
    const review = createModerationReview(userId, patch.surface, patch.text, now);
    writeModerationReview(review);
    return { review, ledger: readSocialLedger(session) };
  }

  if (patch.action === "save_share_draft") {
    const review = createModerationReview(userId, "share_caption", patch.message, now);
    const draft: ShareDraft = {
      id: `draft-${userId}-${patch.platformId}`,
      userId,
      platformId: patch.platformId,
      message: patch.message,
      templateId: patch.templateId,
      selectedAchievementId: patch.selectedAchievementId,
      selectedActionId: patch.selectedActionId,
      hashtags: patch.hashtags ?? [],
      moderationReviewId: review.id,
      updatedAt: now
    };
    db.transaction(() => {
      writeModerationReview(review);
      db.prepare(
        `INSERT INTO share_drafts (id, user_id, platform_id, payload, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`
      ).run(draft.id, userId, patch.platformId, stringifyJson(draft), now);
    })();
    return { draft, review, ledger: readSocialLedger(session) };
  }

  if (patch.action === "record_share_history") {
    const item: ShareHistoryItem = {
      id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      platformId: patch.platformId,
      preparedText: patch.preparedText,
      status: patch.status ?? "prepared",
      selectedAchievementId: patch.selectedAchievementId,
      selectedActionId: patch.selectedActionId,
      createdAt: now
    };
    db.prepare("INSERT INTO share_history (id, user_id, platform_id, payload, created_at) VALUES (?, ?, ?, ?, ?)").run(
      item.id,
      userId,
      patch.platformId,
      stringifyJson(item),
      now
    );
    return { historyItem: item, ledger: readSocialLedger(session) };
  }

  if (patch.action === "save_share_template") {
    const template: ShareTemplate = {
      id: patch.templateId ?? `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      label: patch.label.trim() || "Custom share",
      message: patch.message.trim() || defaultShareMessage,
      platformId: patch.platformId,
      updatedAt: now
    };
    db.prepare(
      `INSERT INTO share_templates (id, user_id, label, payload, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET label = excluded.label, payload = excluded.payload, updated_at = excluded.updated_at`
    ).run(template.id, userId, template.label, stringifyJson(template), now);
    return { template, ledger: readSocialLedger(session) };
  }

  if (patch.action === "delete_share_template") {
    db.prepare("DELETE FROM share_templates WHERE id = ? AND user_id = ?").run(patch.templateId, userId);
    return { ledger: readSocialLedger(session) };
  }

  if (patch.action === "create_comment") {
    const review = createModerationReview(userId, "comment", patch.text, now);
    const comment: SocialComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      authorName: session.displayName,
      targetType: patch.targetType,
      targetId: patch.targetId,
      text: patch.text,
      approvedText: review.status === "ready" ? patch.text.trim() : review.suggestion,
      moderationReviewId: review.id,
      status: contentStatusForReview(review),
      createdAt: now
    };
    db.transaction(() => {
      writeModerationReview(review);
      db.prepare("INSERT INTO social_comments (id, user_id, target_type, target_id, status, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        comment.id,
        userId,
        comment.targetType,
        comment.targetId,
        comment.status,
        stringifyJson(comment),
        now
      );
    })();
    return { comment, review, ledger: readSocialLedger(session) };
  }

  if (patch.action === "create_message") {
    const surface: ShareSurface = patch.messageType === "recruitment" ? "recruitment" : patch.messageType === "event_update" ? "event_update" : "message";
    const review = createModerationReview(userId, surface, patch.text, now);
    const message: SocialMessage = {
      id: `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      authorName: session.displayName,
      recipientType: patch.recipientType,
      recipientId: patch.recipientId,
      messageType: patch.messageType,
      text: patch.text,
      approvedText: review.status === "ready" ? patch.text.trim() : review.suggestion,
      moderationReviewId: review.id,
      status: contentStatusForReview(review),
      createdAt: now
    };
    db.transaction(() => {
      writeModerationReview(review);
      db.prepare("INSERT INTO social_messages (id, user_id, recipient_type, recipient_id, status, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        message.id,
        userId,
        message.recipientType,
        message.recipientId,
        message.status,
        stringifyJson(message),
        now
      );
    })();
    return { message, review, ledger: readSocialLedger(session) };
  }

  if (patch.action === "report_content") {
    const report: SocialReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      contentType: patch.contentType,
      contentId: patch.contentId,
      reason: patch.reason,
      note: patch.note ?? "",
      status: "queued",
      createdAt: now
    };
    db.prepare("INSERT INTO social_reports (id, user_id, content_type, content_id, status, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      report.id,
      userId,
      report.contentType,
      report.contentId,
      report.status,
      stringifyJson(report),
      now
    );
    return { report, ledger: readSocialLedger(session) };
  }

  if (patch.action === "account_control") {
    if (!patch.enabled) {
      db.prepare("DELETE FROM social_account_controls WHERE user_id = ? AND target_id = ? AND control = ?").run(userId, patch.targetId, patch.control);
      return { ledger: readSocialLedger(session) };
    }

    const control: SocialAccountControl = {
      userId,
      targetId: patch.targetId,
      control: patch.control,
      note: patch.note,
      updatedAt: now
    };
    db.prepare(
      `INSERT INTO social_account_controls (user_id, target_id, control, payload, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, target_id, control) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`
    ).run(userId, patch.targetId, patch.control, stringifyJson(control), now);
    return { control, ledger: readSocialLedger(session) };
  }

  if (patch.action === "review_moderation") {
    const review = updateModerationReview(patch.reviewId, patch.decision, patch.reviewerNote);
    return { review, queue: readModerationReviewQueue(), ledger: readSocialLedger(session) };
  }

  if (patch.action === "resolve_report") {
    const report = updateSocialReport(patch.reportId, patch.status, patch.resolutionNote);
    return { report, queue: readModerationReviewQueue(), ledger: readSocialLedger(session) };
  }

  if (patch.action === "update_preferences") {
    const preferences = writeSocialPreferences(userId, patch.preferences, now);
    return { preferences, ledger: readSocialLedger(session) };
  }

  if (patch.action === "mark_notifications_read") {
    const ledger = readSocialLedger(session);
    const notificationIds = patch.notificationIds?.length ? patch.notificationIds : ledger.notifications.map((notification) => notification.id);
    const writeRead = db.prepare(
      `INSERT INTO social_notification_reads (user_id, notification_id, read_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, notification_id) DO UPDATE SET read_at = excluded.read_at`
    );
    db.transaction(() => {
      notificationIds.forEach((notificationId) => writeRead.run(userId, notificationId, now));
    })();
    return { readNotificationIds: notificationIds, ledger: readSocialLedger(session) };
  }

  return { ledger: readSocialLedger(session) };
}

export function readPublicComments(targetType: SocialTargetType, targetId: string, limit = 12) {
  const db = getHandprintDatabase();
  return (
    db
      .prepare("SELECT payload FROM social_comments WHERE target_type = ? AND target_id = ? ORDER BY created_at DESC LIMIT ?")
      .all(targetType, targetId, limit) as { payload: string }[]
  ).map((row) => parseJson<SocialComment>(row.payload));
}

export function readPublicCommentCounts(targets: { targetType: SocialTargetType; targetId: string }[]) {
  const db = getHandprintDatabase();
  const count = db.prepare("SELECT COUNT(*) as count FROM social_comments WHERE target_type = ? AND target_id = ?");
  return Object.fromEntries(
    targets.map((target) => {
      const row = count.get(target.targetType, target.targetId) as { count: number };
      return [`${target.targetType}:${target.targetId}`, row.count];
    })
  );
}

export function readModerationReviewQueue(limit = 50) {
  const db = getHandprintDatabase();
  const reviews = (
    db
      .prepare("SELECT payload FROM moderation_reviews WHERE status != 'ready' ORDER BY created_at DESC LIMIT ?")
      .all(limit) as { payload: string }[]
  ).map((row) => normalizeModerationReview(parseJson<SocialModerationReview>(row.payload)));
  const reports = (
    db
      .prepare("SELECT payload FROM social_reports WHERE status != 'resolved' ORDER BY created_at DESC LIMIT ?")
      .all(limit) as { payload: string }[]
  ).map((row) => parseJson<SocialReport>(row.payload));
  return { reviews, reports };
}

export function createModerationReview(userId: string, surface: ShareSurface, sourceText: string, createdAt = new Date().toISOString()): SocialModerationReview {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    return {
      id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      surface,
      sourceText,
      status: "rewrite",
      issues: ["Add a short, positive invitation before posting."],
      suggestion: defaultShareMessage,
      confidence: 0.72,
      createdAt
    };
  }

  const issues = discouragingLanguageRules.filter((rule) => rule.pattern.test(trimmed)).map((rule) => rule.issue);
  const hasUsefulActionLanguage = /\b(join|help|serve|show up|volunteer|build|support|thank|invite|welcome|learn|repair|clean|pack|mentor|give|pick|come|action)\b/i.test(
    trimmed
  );
  const hasVerifiedClaimRisk = /\b(guaranteed|officially proves|best ever|everyone knows|no one else)\b/i.test(trimmed);
  const severe = severeLanguagePattern.test(trimmed);

  if (hasVerifiedClaimRisk) issues.push("Big claims should be tied to what Handprint can verify.");
  if (!hasUsefulActionLanguage) issues.push("Add a useful next step, thank-you, or invitation.");
  if (severe) issues.push("Severe language needs human review before it can publish.");

  return {
    id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    surface,
    sourceText,
    status: severe ? "escalated" : issues.length === 0 ? "ready" : "rewrite",
    issues,
    suggestion: issues.length === 0 ? trimmed : rewriteHandprintMessage(trimmed),
    confidence: confidenceForReview(issues, severe, hasUsefulActionLanguage),
    createdAt
  };
}

function writeModerationReview(review: SocialModerationReview) {
  const db = getHandprintDatabase();
  db.prepare("INSERT INTO moderation_reviews (id, user_id, surface, status, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    review.id,
    review.userId,
    review.surface,
    review.status,
    stringifyJson(review),
    review.createdAt
  );
}

function normalizeShareHistoryItem(item: ShareHistoryItem): ShareHistoryItem {
  return { ...item, status: item.status ?? "prepared" };
}

function normalizeModerationReview(review: SocialModerationReview): SocialModerationReview {
  return { ...review, confidence: review.confidence ?? confidenceForReview(review.issues ?? [], review.status === "escalated", true) };
}

function updateModerationReview(reviewId: string, decision: SocialReviewDecision, reviewerNote?: string) {
  const db = getHandprintDatabase();
  const row = db.prepare("SELECT payload FROM moderation_reviews WHERE id = ?").get(reviewId) as { payload: string } | undefined;
  if (!row) throw new Error("Moderation review not found.");
  const current = parseJson<SocialModerationReview>(row.payload);
  const updated = {
    ...current,
    status: decision === "approved" ? "ready" : decision === "hold" ? "escalated" : "rewrite",
    reviewerNote,
    reviewerDecision: decision,
    reviewedAt: new Date().toISOString()
  } satisfies SocialModerationReview;
  db.prepare("UPDATE moderation_reviews SET status = ?, payload = ? WHERE id = ?").run(updated.status, stringifyJson(updated), reviewId);
  return updated;
}

function updateSocialReport(reportId: string, status: SocialReportResolution, resolutionNote?: string) {
  const db = getHandprintDatabase();
  const row = db.prepare("SELECT payload FROM social_reports WHERE id = ?").get(reportId) as { payload: string } | undefined;
  if (!row) throw new Error("Social report not found.");
  const current = parseJson<SocialReport>(row.payload);
  const updated: SocialReport = {
    ...current,
    status,
    resolutionNote,
    resolvedAt: status === "resolved" ? new Date().toISOString() : current.resolvedAt
  };
  db.prepare("UPDATE social_reports SET status = ?, payload = ? WHERE id = ?").run(updated.status, stringifyJson(updated), reportId);
  return updated;
}

function readSocialPreferences(userId: string) {
  const db = getHandprintDatabase();
  const row = db.prepare("SELECT payload FROM social_preferences WHERE user_id = ?").get(userId) as { payload: string } | undefined;
  return row ? { ...defaultSocialPreferences, ...parseJson<Partial<SocialPreferences>>(row.payload) } : defaultSocialPreferences;
}

function writeSocialPreferences(userId: string, patch: Partial<SocialPreferences>, updatedAt: string) {
  const db = getHandprintDatabase();
  const preferences = { ...readSocialPreferences(userId), ...patch };
  db.prepare(
    `INSERT INTO social_preferences (user_id, payload, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`
  ).run(userId, stringifyJson(preferences), updatedAt);
  return preferences;
}

function readSocialNotificationReads(userId: string) {
  const db = getHandprintDatabase();
  const rows = db.prepare("SELECT notification_id FROM social_notification_reads WHERE user_id = ?").all(userId) as { notification_id: string }[];
  return new Set(rows.map((row) => row.notification_id));
}

function deriveNotifications(
  ledger: Pick<SocialLedger, "history" | "moderationReviews" | "comments" | "messages" | "reports">,
  preferences: SocialPreferences,
  readNotificationIds = new Set<string>()
): SocialNotification[] {
  if (preferences.quietMode) return [];
  const notifications: SocialNotification[] = [];
  if (preferences.notifyComments) {
    ledger.comments.slice(0, 6).forEach((comment) =>
      notifications.push({
        id: `notif-${comment.id}`,
        type: "comment",
        title: "Comment recorded",
        detail: comment.approvedText,
        targetId: comment.targetId,
        unread: comment.status !== "sent" && !readNotificationIds.has(`notif-${comment.id}`),
        createdAt: comment.createdAt
      })
    );
  }
  if (preferences.notifyMessages) {
    ledger.messages.slice(0, 6).forEach((message) =>
      notifications.push({
        id: `notif-${message.id}`,
        type: "message",
        title: "Message request",
        detail: message.approvedText,
        targetId: message.recipientId,
        unread: message.status !== "sent" && !readNotificationIds.has(`notif-${message.id}`),
        createdAt: message.createdAt
      })
    );
  }
  if (preferences.notifyReviews) {
    ledger.moderationReviews.slice(0, 8).forEach((review) =>
      notifications.push({
        id: `notif-${review.id}`,
        type: "review",
        title: review.status === "ready" ? "Text ready" : "Affirmation Agent review",
        detail: review.issues[0] ?? review.suggestion,
        unread: review.status !== "ready" && !readNotificationIds.has(`notif-${review.id}`),
        createdAt: review.createdAt
      })
    );
  }
  if (preferences.notifyReports) {
    ledger.reports.slice(0, 6).forEach((report) =>
      notifications.push({
        id: `notif-${report.id}`,
        type: "report",
        title: report.status === "resolved" ? "Report resolved" : "Report queued",
        detail: report.resolutionNote ?? report.reason,
        targetId: report.contentId,
        unread: report.status !== "resolved" && !readNotificationIds.has(`notif-${report.id}`),
        createdAt: report.createdAt
      })
    );
  }
  ledger.history.slice(0, 4).forEach((history) =>
    notifications.push({
      id: `notif-${history.id}`,
      type: "share",
      title: history.status === "shared" ? "Share kit recorded" : "Share prepared",
      detail: history.preparedText.split("\n")[0] ?? "Handprint share",
      unread: false,
      createdAt: history.createdAt
    })
  );
  return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
}

function confidenceForReview(issues: string[], severe: boolean, hasUsefulActionLanguage: boolean) {
  if (severe) return 0.96;
  if (issues.length >= 2) return 0.9;
  if (issues.length === 1) return hasUsefulActionLanguage ? 0.78 : 0.84;
  return 0.92;
}

function contentStatusForReview(review: SocialModerationReview): SocialContentStatus {
  if (review.status === "ready") return "sent";
  if (review.status === "escalated") return "escalated";
  return "rewrite_suggested";
}

function rewriteHandprintMessage(message: string) {
  const lowered = message.toLowerCase();

  if (severeLanguagePattern.test(message)) {
    return `I am concerned enough that this needs careful human review. I want to keep the focus on safety, dignity, and useful next action.`;
  }

  if (lowered.includes("frustrat") || lowered.includes("angry") || lowered.includes("hate")) {
    return `I am frustrated by what needs to change, and I want to turn that energy into useful action. ${publicHandprintProfile.inviteText}`;
  }

  if (lowered.includes("idiot") || lowered.includes("stupid") || lowered.includes("trash") || lowered.includes("worthless")) {
    return `I want to focus less on blame and more on what we can do next. ${publicHandprintProfile.inviteText}`;
  }

  if (message.length < 48) {
    return `${message} ${publicHandprintProfile.inviteText}`;
  }

  return `${message} I am sharing this as an invitation to do something useful together.`;
}
