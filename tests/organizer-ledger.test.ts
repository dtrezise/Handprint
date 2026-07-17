import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { localActions, organizerConfirmations, type OrganizerImpactProfile } from "../lib/handprint-data";
import { resetHandprintDatabaseCache } from "../lib/server/database";
import { createImpactReceiptFromConfirmation, readImpactReceiptLedger, writeImpactReceiptLedger } from "../lib/server/impact-receipt-ledger";
import {
  applyOrganizerLedgerPatch,
  findDuplicateOrganizer,
  normalizeOrgName,
  readOrganizationReviewQueue,
  readOrganizerLedger,
  recordOrganizationSubmissionReview,
  writeOrganizerLedger
} from "../lib/server/organizer-ledger";

const baseOrganizer: OrganizerImpactProfile = {
  id: "org-test-pantry",
  handle: "test-pantry",
  name: "The Test Pantry Inc.",
  type: "Food support nonprofit",
  trustTier: "Verified",
  publicSummary: "A test organizer.",
  savedByViewer: false,
  permissionRoles: ["organizer_editor", "handprint_reviewer"],
  eventsHosted: 1,
  attendeesMobilized: 10,
  confirmedParticipants: 8,
  volunteerHours: 16,
  handprintPointsIssued: 120,
  repeatOrganizerRate: 40,
  sponsorSlotsUsed: 0,
  sponsorSlotsLimit: 1,
  sponsorSlotAudit: [],
  featuredEventIds: ["food-shelf-saturday"],
  impactHighlights: [{ label: "Boxes", value: "20" }],
  impactReceiptIds: [],
  sponsorPolicy: "Sponsors cannot buy rewards.",
  fundraisingPolicy: "Receipts follow completed events.",
  grantReadySummary: "Verified organizer test summary.",
  accolades: [
    {
      id: "accolade-test",
      title: "Test accolade",
      category: "Impact",
      description: "Test accolade description.",
      issuedAt: "Pilot",
      evidence: "Test evidence.",
      status: "pending_review",
      accent: "#1f7a8c",
      reviewHistory: []
    }
  ]
};

test("normalizes and matches duplicate organizer names", () => {
  assert.equal(normalizeOrgName("The Test Pantry, Inc."), "test pantry");
  assert.equal(findDuplicateOrganizer([baseOrganizer], "Test Pantry")?.id, baseOrganizer.id);
  assert.equal(findDuplicateOrganizer([baseOrganizer], "Test Pantry Incorporated")?.id, baseOrganizer.id);
  assert.equal(findDuplicateOrganizer([baseOrganizer], "Community Test Pantry Foundation")?.id, baseOrganizer.id);
});

test("sponsor slot updates require reviewer role and append audit history", () => {
  assert.throws(() =>
    applyOrganizerLedgerPatch([baseOrganizer], {
      sponsorSlotUpdate: {
        organizerId: baseOrganizer.id,
        sponsorSlotsUsed: 1,
        sponsorSlotsLimit: 2,
        actorRole: "organizer_editor"
      }
    })
  );

  const updated = applyOrganizerLedgerPatch(
    [baseOrganizer],
    {
      sponsorSlotUpdate: {
        organizerId: baseOrganizer.id,
        sponsorSlotsUsed: 1,
        sponsorSlotsLimit: 2,
        actorRole: "handprint_reviewer",
        note: "Approved one pilot sponsor slot."
      }
    },
    new Date("2026-07-09T12:00:00.000Z")
  )[0];

  assert.equal(updated.sponsorSlotsUsed, 1);
  assert.equal(updated.sponsorSlotsLimit, 2);
  assert.equal(updated.sponsorSlotAudit?.[0]?.note, "Approved one pilot sponsor slot.");
  assert.equal(updated.sponsorSlotAudit?.[0]?.previousUsed, 0);
});

test("session roles override client-supplied actor roles", () => {
  assert.throws(() =>
    applyOrganizerLedgerPatch(
      [baseOrganizer],
      {
        sponsorSlotUpdate: {
          organizerId: baseOrganizer.id,
          sponsorSlotsUsed: 1,
          sponsorSlotsLimit: 2,
          actorRole: "handprint_reviewer"
        }
      },
      new Date("2026-07-09T12:00:00.000Z"),
      []
    )
  );

  const updated = applyOrganizerLedgerPatch(
    [baseOrganizer],
    {
      profileUpdate: {
        id: baseOrganizer.id,
        publicSummary: "Edited by a real session.",
        actorRole: "viewer"
      }
    },
    new Date("2026-07-09T12:00:00.000Z"),
    ["organizer_editor"]
  )[0];

  assert.equal(updated.publicSummary, "Edited by a real session.");
});

test("accolade updates append review history", () => {
  const updated = applyOrganizerLedgerPatch(
    [baseOrganizer],
    {
      accoladeUpdate: {
        organizerId: baseOrganizer.id,
        accoladeId: "accolade-test",
        status: "approved",
        actorRole: "handprint_reviewer",
        note: "Evidence accepted."
      }
    },
    new Date("2026-07-09T12:00:00.000Z")
  )[0];

  assert.equal(updated.accolades[0].status, "approved");
  assert.equal(updated.accolades[0].reviewHistory?.[0]?.note, "Evidence accepted.");
  assert.equal(updated.reviewNotes?.[0]?.status, "approved");
});

test("impact receipts can be created from organizer confirmation", () => {
  const confirmation = organizerConfirmations.find((item) => item.id === "confirmation-food-shelf")!;
  const action = localActions.find((item) => item.id === confirmation.actionId)!;
  const receipt = createImpactReceiptFromConfirmation(confirmation, action, baseOrganizer);

  assert.equal(receipt.id, "receipt-confirmation-food-shelf");
  assert.equal(receipt.organizerId, baseOrganizer.id);
  assert.equal(receipt.eventId, action.id);
  assert.equal(receipt.createdFromConfirmationId, confirmation.id);
});

test("organizer ledgers persist follows and duplicate review queue items in sqlite", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "handprint-db-"));
  process.env.HANDPRINT_DB_PATH = path.join(tempDir, "handprint.sqlite");
  resetHandprintDatabaseCache();

  try {
    const session = { id: "session-test", roles: ["organizer_editor" as const] };
    await writeOrganizerLedger([{ ...baseOrganizer, savedByViewer: true }], session);
    const ledger = await readOrganizerLedger(session);
    assert.equal(ledger.profiles[0].savedByViewer, true);

    await recordOrganizationSubmissionReview(
      {
        ...baseOrganizer,
        id: "org-test-pantry-submitted",
        handle: "test-pantry-submitted",
        name: "Community Test Pantry Foundation"
      },
      ledger.profiles
    );
    const queue = await readOrganizationReviewQueue();
    assert.equal(queue[0].status, "possible_duplicate");
    assert.equal(queue[0].duplicateOfId, baseOrganizer.id);
  } finally {
    resetHandprintDatabaseCache();
    delete process.env.HANDPRINT_DB_PATH;
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("impact receipt ledger persists updates in sqlite", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "handprint-db-"));
  process.env.HANDPRINT_DB_PATH = path.join(tempDir, "handprint.sqlite");
  resetHandprintDatabaseCache();

  try {
    const confirmation = organizerConfirmations.find((item) => item.id === "confirmation-food-shelf")!;
    const action = localActions.find((item) => item.id === confirmation.actionId)!;
    const receipt = createImpactReceiptFromConfirmation(confirmation, action, baseOrganizer);
    await writeImpactReceiptLedger([receipt]);
    await writeImpactReceiptLedger([{ ...receipt, evidence: "Updated evidence." }]);
    const ledger = await readImpactReceiptLedger();
    assert.equal(ledger.receipts.length, 1);
    assert.equal(ledger.receipts[0].evidence, "Updated evidence.");
    assert.equal(ledger.receipts[0].createdFromConfirmationId, confirmation.id);
  } finally {
    resetHandprintDatabaseCache();
    delete process.env.HANDPRINT_DB_PATH;
    rmSync(tempDir, { recursive: true, force: true });
  }
});
