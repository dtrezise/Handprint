import { readFileSync } from "fs";
import path from "path";
import { initialMarks, type HandprintMark, type RsvpStatus } from "@/lib/handprint-data";
import { getHandprintDatabase, parseJson, stringifyJson } from "@/lib/server/database";

export type RewardLedger = {
  profileHandle: string;
  lastUpdatedAt: string;
  rsvps: Record<string, RsvpStatus>;
  marks: HandprintMark[];
};

const legacyRewardLedgerPath = path.join(process.cwd(), "data", "reward-ledger.json");

export async function readRewardLedger(profileHandle = "dan"): Promise<RewardLedger> {
  seedRewardLedgerIfNeeded(profileHandle);
  const row = getHandprintDatabase()
    .prepare("SELECT payload FROM reward_ledgers WHERE profile_handle = ?")
    .get(profileHandle) as { payload: string } | undefined;
  return row ? parseJson<RewardLedger>(row.payload) : defaultRewardLedger(profileHandle);
}

export async function writeRewardLedger(ledger: RewardLedger) {
  const nextLedger = {
    ...ledger,
    lastUpdatedAt: new Date().toISOString()
  };
  getHandprintDatabase()
    .prepare(
      `INSERT INTO reward_ledgers (profile_handle, payload, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(profile_handle) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`
    )
    .run(nextLedger.profileHandle, stringifyJson(nextLedger), nextLedger.lastUpdatedAt);
  return nextLedger;
}

function seedRewardLedgerIfNeeded(profileHandle: string) {
  const db = getHandprintDatabase();
  const existing = db.prepare("SELECT profile_handle FROM reward_ledgers WHERE profile_handle = ?").get(profileHandle);
  if (existing) return;
  const ledger = loadLegacyRewardLedger(profileHandle);
  db.prepare("INSERT INTO reward_ledgers (profile_handle, payload, updated_at) VALUES (?, ?, ?)")
    .run(ledger.profileHandle, stringifyJson(ledger), ledger.lastUpdatedAt);
}

function loadLegacyRewardLedger(profileHandle: string) {
  try {
    const parsed = JSON.parse(readFileSync(legacyRewardLedgerPath, "utf8")) as RewardLedger;
    return parsed;
  } catch {
    return defaultRewardLedger(profileHandle);
  }
}

function defaultRewardLedger(profileHandle: string): RewardLedger {
  return {
    profileHandle,
    lastUpdatedAt: new Date().toISOString(),
    rsvps: { "tenant-rights-clinic": "checked_in" },
    marks: initialMarks
  };
}
