import { defaultProfile, type UserProfile } from "@/lib/handprint-data";
import { getHandprintDatabase, parseJson, stringifyJson } from "@/lib/server/database";
import type { HandprintSession } from "@/lib/server/session";

export type ProfileSettings = {
  avatarUrl?: string;
  avatarSkinId: string;
  notifyComments: boolean;
  notifyMessages: boolean;
  notifyReviews: boolean;
  quietSocialMode: boolean;
  publicProfileVisible: boolean;
  badgesVisible: boolean;
  qrEnabled: boolean;
  qrRotatedAt: string;
  messageRequestPolicy: "everyone" | "followed_network" | "event_network";
};

export type ProfileSettingsLedger = {
  profile: UserProfile;
  settings: ProfileSettings;
  updatedAt: string;
};

export const defaultProfileSettings: ProfileSettings = {
  avatarSkinId: "generic",
  notifyComments: true,
  notifyMessages: true,
  notifyReviews: true,
  quietSocialMode: false,
  publicProfileVisible: true,
  badgesVisible: true,
  qrEnabled: true,
  qrRotatedAt: "2026-07-09",
  messageRequestPolicy: "followed_network"
};

export function readProfileSettingsLedger(session: Pick<HandprintSession, "id">): ProfileSettingsLedger {
  const db = getHandprintDatabase();
  const row = db.prepare("SELECT profile_payload, settings_payload, updated_at FROM profile_settings WHERE user_id = ?").get(session.id) as
    | { profile_payload: string; settings_payload: string; updated_at: string }
    | undefined;

  if (!row) {
    return {
      profile: defaultProfileForSettings(),
      settings: defaultProfileSettings,
      updatedAt: "seed"
    };
  }

  return {
    profile: { ...defaultProfileForSettings(), ...parseJson<Partial<UserProfile>>(row.profile_payload) },
    settings: { ...defaultProfileSettings, ...parseJson<Partial<ProfileSettings>>(row.settings_payload) },
    updatedAt: row.updated_at
  };
}

export function writeProfileSettingsLedger(
  session: Pick<HandprintSession, "id">,
  patch: {
    profile?: Partial<UserProfile>;
    settings?: Partial<ProfileSettings>;
  }
) {
  const current = readProfileSettingsLedger(session);
  const now = new Date().toISOString();
  const profile = { ...current.profile, ...(patch.profile ?? {}) };
  const settings = { ...current.settings, ...(patch.settings ?? {}) };
  const db = getHandprintDatabase();

  db.prepare(
    `INSERT INTO profile_settings (user_id, profile_payload, settings_payload, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       profile_payload = excluded.profile_payload,
       settings_payload = excluded.settings_payload,
       updated_at = excluded.updated_at`
  ).run(session.id, stringifyJson(profile), stringifyJson(settings), now);

  return { profile, settings, updatedAt: now };
}

export function rotateProfileQr(session: Pick<HandprintSession, "id">) {
  return writeProfileSettingsLedger(session, {
    settings: {
      qrEnabled: true,
      qrRotatedAt: new Date().toISOString().slice(0, 10)
    }
  });
}

function defaultProfileForSettings(): UserProfile {
  return { ...defaultProfile, rewardsEnabled: true, interests: [], skills: [] };
}
