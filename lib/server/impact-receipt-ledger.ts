import { readFileSync } from "fs";
import path from "path";
import { impactReceipts, type ImpactReceipt, type LocalAction, type OrganizerConfirmation, type OrganizerImpactProfile } from "@/lib/handprint-data";
import { getHandprintDatabase, parseJson, stringifyJson } from "@/lib/server/database";

export type ImpactReceiptLedger = {
  lastUpdatedAt: string;
  receipts: ImpactReceipt[];
};

export type ImpactReceiptPatch = {
  receipt?: ImpactReceipt;
  receipts?: ImpactReceipt[];
};

export const impactReceiptLedgerPath = path.join(process.cwd(), "data", "impact-receipts.json");

export async function readImpactReceiptLedger(): Promise<ImpactReceiptLedger> {
  const db = getHandprintDatabase();
  seedImpactReceiptsIfNeeded();
  const receipts = (
    db
      .prepare("SELECT payload FROM impact_receipts ORDER BY updated_at DESC, id ASC")
      .all() as { payload: string }[]
  ).map((row) => parseJson<ImpactReceipt>(row.payload));

  return {
    lastUpdatedAt: latestReceiptUpdate(),
    receipts
  };
}

export async function writeImpactReceiptLedger(receipts: ImpactReceipt[]): Promise<ImpactReceiptLedger> {
  const db = getHandprintDatabase();
  const now = new Date().toISOString();
  const ids = new Set(receipts.map((receipt) => receipt.id));
  const upsert = db.prepare(
    `INSERT INTO impact_receipts (id, organizer_id, event_id, created_from_confirmation_id, payload, updated_at)
     VALUES (@id, @organizerId, @eventId, @createdFromConfirmationId, @payload, @updatedAt)
     ON CONFLICT(id) DO UPDATE SET
       organizer_id = excluded.organizer_id,
       event_id = excluded.event_id,
       created_from_confirmation_id = excluded.created_from_confirmation_id,
       payload = excluded.payload,
       updated_at = excluded.updated_at`
  );
  const deleteReceipt = db.prepare("DELETE FROM impact_receipts WHERE id = ?");

  db.transaction(() => {
    const existingIds = (db.prepare("SELECT id FROM impact_receipts").all() as { id: string }[]).map((row) => row.id);
    existingIds.filter((id) => !ids.has(id)).forEach((id) => deleteReceipt.run(id));
    receipts.forEach((receipt) =>
      upsert.run({
        id: receipt.id,
        organizerId: receipt.organizerId,
        eventId: receipt.eventId,
        createdFromConfirmationId: receipt.createdFromConfirmationId ?? null,
        payload: stringifyJson(receipt),
        updatedAt: now
      })
    );
  })();

  return readImpactReceiptLedger();
}

export function applyImpactReceiptPatch(receipts: ImpactReceipt[], patch: ImpactReceiptPatch) {
  if (patch.receipts) return patch.receipts;
  if (patch.receipt) return upsertReceipt(receipts, patch.receipt);
  return receipts;
}

export function upsertReceipt(receipts: ImpactReceipt[], receipt: ImpactReceipt) {
  const exists = receipts.some((item) => item.id === receipt.id);
  if (exists) return receipts.map((item) => (item.id === receipt.id ? receipt : item));
  return [receipt, ...receipts];
}

export function createImpactReceiptFromConfirmation(
  confirmation: OrganizerConfirmation,
  action: LocalAction,
  organizer: OrganizerImpactProfile
): ImpactReceipt {
  return {
    id: `receipt-${confirmation.id}`,
    organizerId: organizer.id,
    eventId: action.id,
    title: action.title,
    beneficiary: action.beneficiary,
    accomplishment: action.impactClaim || action.impact,
    confirmedBy: confirmation.organizer,
    issuedAt: confirmation.confirmedAt,
    evidence: confirmation.evidence,
    createdFromConfirmationId: confirmation.id
  };
}

function seedImpactReceiptsIfNeeded() {
  const db = getHandprintDatabase();
  const count = (db.prepare("SELECT COUNT(*) AS count FROM impact_receipts").get() as { count: number }).count;
  if (count > 0) return;
  const seedReceipts = loadLegacyReceipts();
  const now = new Date().toISOString();
  const insert = db.prepare(
    `INSERT INTO impact_receipts (id, organizer_id, event_id, created_from_confirmation_id, payload, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  db.transaction(() => {
    seedReceipts.forEach((receipt) =>
      insert.run(receipt.id, receipt.organizerId, receipt.eventId, receipt.createdFromConfirmationId ?? null, stringifyJson(receipt), now)
    );
  })();
}

function loadLegacyReceipts() {
  try {
    const ledger = readFileSync(impactReceiptLedgerPath, "utf8");
    const parsed = JSON.parse(ledger) as ImpactReceiptLedger;
    if (parsed.receipts?.length) return parsed.receipts;
  } catch {
    return impactReceipts;
  }
  return impactReceipts;
}

function latestReceiptUpdate() {
  const db = getHandprintDatabase();
  const row = db.prepare("SELECT MAX(updated_at) AS lastUpdatedAt FROM impact_receipts").get() as { lastUpdatedAt: string | null };
  return row.lastUpdatedAt ?? new Date().toISOString();
}
