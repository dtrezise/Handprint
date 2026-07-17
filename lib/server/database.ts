import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";

export type HandprintDatabase = Database.Database;

const dbCache = new Map<string, HandprintDatabase>();

export function getHandprintDatabase() {
  const dbPath = process.env.HANDPRINT_DB_PATH ?? path.join(process.cwd(), "data", "handprint.sqlite");
  const cacheKey = dbPath === ":memory:" ? `memory-${process.pid}` : dbPath;
  const cached = dbCache.get(cacheKey);
  if (cached) return cached;

  if (dbPath !== ":memory:") {
    mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  if (dbPath !== ":memory:") db.pragma("journal_mode = WAL");
  migrate(db);
  dbCache.set(cacheKey, db);
  return db;
}

export function resetHandprintDatabaseCache() {
  Array.from(dbCache.values()).forEach((db) => {
    db.close();
  });
  dbCache.clear();
}

function migrate(db: HandprintDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizer_profiles (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      saved_by_viewer INTEGER NOT NULL DEFAULT 0,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_organizer_profiles_normalized_name
      ON organizer_profiles(normalized_name);

    CREATE TABLE IF NOT EXISTS impact_receipts (
      id TEXT PRIMARY KEY,
      organizer_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      created_from_confirmation_id TEXT UNIQUE,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_impact_receipts_organizer_id
      ON impact_receipts(organizer_id);

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      roles_json TEXT NOT NULL,
      active_profile_handle TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organization_follows (
      user_id TEXT NOT NULL,
      organizer_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, organizer_id)
    );

    CREATE TABLE IF NOT EXISTS world_changer_follows (
      user_id TEXT NOT NULL,
      handle TEXT NOT NULL,
      saved_by_viewer INTEGER NOT NULL DEFAULT 1,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, handle)
    );

    CREATE TABLE IF NOT EXISTS organization_review_queue (
      id TEXT PRIMARY KEY,
      submitted_name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      duplicate_of_id TEXT,
      duplicate_of_name TEXT,
      status TEXT NOT NULL,
      reason TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_organization_review_queue_status
      ON organization_review_queue(status);

    CREATE TABLE IF NOT EXISTS sponsor_slot_audit (
      id TEXT PRIMARY KEY,
      organizer_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reward_ledgers (
      profile_handle TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS share_drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_share_drafts_user_id
      ON share_drafts(user_id);

    CREATE TABLE IF NOT EXISTS share_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_share_history_user_id
      ON share_history(user_id);

    CREATE TABLE IF NOT EXISTS share_templates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      label TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_share_templates_user_id
      ON share_templates(user_id);

    CREATE TABLE IF NOT EXISTS moderation_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      surface TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_moderation_reviews_status
      ON moderation_reviews(status);

    CREATE TABLE IF NOT EXISTS social_comments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_social_comments_target
      ON social_comments(target_type, target_id);

    CREATE TABLE IF NOT EXISTS social_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      recipient_type TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_social_messages_recipient
      ON social_messages(recipient_type, recipient_id);

    CREATE TABLE IF NOT EXISTS social_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_account_controls (
      user_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      control TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, target_id, control)
    );

    CREATE TABLE IF NOT EXISTS social_preferences (
      user_id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_notification_reads (
      user_id TEXT NOT NULL,
      notification_id TEXT NOT NULL,
      read_at TEXT NOT NULL,
      PRIMARY KEY (user_id, notification_id)
    );

    CREATE TABLE IF NOT EXISTS profile_settings (
      user_id TEXT PRIMARY KEY,
      profile_payload TEXT NOT NULL,
      settings_payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function stringifyJson(value: unknown) {
  return JSON.stringify(value);
}
