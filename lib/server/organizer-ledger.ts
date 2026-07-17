import { readFileSync } from "fs";
import path from "path";
import {
  initialOrganizerImpactProfiles,
  type OrganizerImpactProfile,
  type OrganizerPermissionRole,
  type TrustReviewNote
} from "@/lib/handprint-data";
import { getHandprintDatabase, parseJson, stringifyJson } from "@/lib/server/database";
import type { HandprintSession } from "@/lib/server/session";

export type OrganizerLedger = {
  lastUpdatedAt: string;
  profiles: OrganizerImpactProfile[];
};

export type OrganizationReviewQueueItem = {
  id: string;
  submittedName: string;
  normalizedName: string;
  duplicateOfId?: string;
  duplicateOfName?: string;
  status: "possible_duplicate" | "needs_review" | "resolved";
  reason: string;
  createdAt: string;
  resolvedAt?: string;
};

export type OrganizerLedgerPatch = {
  profiles?: OrganizerImpactProfile[];
  profile?: OrganizerImpactProfile;
  profileUpdate?: Partial<OrganizerImpactProfile> & { id: string; actorRole?: OrganizerPermissionRole };
  followUpdate?: {
    organizerId: string;
    savedByViewer: boolean;
  };
  sponsorSlotUpdate?: {
    organizerId: string;
    sponsorSlotsUsed: number;
    sponsorSlotsLimit: number;
    actorRole?: OrganizerPermissionRole;
    note?: string;
  };
  impactReceiptUpdate?: {
    organizerId: string;
    receiptId: string;
    actorRole?: OrganizerPermissionRole;
  };
  reviewNote?: {
    organizerId: string;
    note: string;
    status?: TrustReviewNote["status"];
    actorRole?: OrganizerPermissionRole;
  };
  accoladeUpdate?: {
    organizerId: string;
    accoladeId: string;
    status: "approved" | "pending_review";
    note?: string;
    actorRole?: OrganizerPermissionRole;
  };
};

export const organizerLedgerPath = path.join(process.cwd(), "data", "organizer-profiles.json");

export async function readOrganizerLedger(session?: Pick<HandprintSession, "id">): Promise<OrganizerLedger> {
  const db = getHandprintDatabase();
  seedOrganizerProfilesIfNeeded();

  const rows = db
    .prepare("SELECT payload, saved_by_viewer FROM organizer_profiles ORDER BY updated_at DESC, name ASC")
    .all() as { payload: string; saved_by_viewer: number }[];
  const profiles = rows.map((row) => ({ ...parseJson<OrganizerImpactProfile>(row.payload), savedByViewer: Boolean(row.saved_by_viewer) }));

  if (session?.id) {
    const follows = new Set(
      (
        db
          .prepare("SELECT organizer_id FROM organization_follows WHERE user_id = ?")
          .all(session.id) as { organizer_id: string }[]
      ).map((row) => row.organizer_id)
    );
    return {
      lastUpdatedAt: latestOrganizerUpdate(),
      profiles: profiles.map((profile) => ({ ...profile, savedByViewer: follows.has(profile.id) }))
    };
  }

  return {
    lastUpdatedAt: latestOrganizerUpdate(),
    profiles
  };
}

export async function writeOrganizerLedger(profiles: OrganizerImpactProfile[], session?: Pick<HandprintSession, "id">): Promise<OrganizerLedger> {
  const db = getHandprintDatabase();
  const now = new Date().toISOString();
  const ids = new Set(profiles.map((profile) => profile.id));
  const upsert = db.prepare(
    `INSERT INTO organizer_profiles (id, handle, name, normalized_name, saved_by_viewer, payload, updated_at)
     VALUES (@id, @handle, @name, @normalizedName, @savedByViewer, @payload, @updatedAt)
     ON CONFLICT(id) DO UPDATE SET
       handle = excluded.handle,
       name = excluded.name,
       normalized_name = excluded.normalized_name,
       saved_by_viewer = excluded.saved_by_viewer,
       payload = excluded.payload,
       updated_at = excluded.updated_at`
  );
  const deleteProfile = db.prepare("DELETE FROM organizer_profiles WHERE id = ?");
  const writeFollow = db.prepare(
    `INSERT INTO organization_follows (user_id, organizer_id, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, organizer_id) DO NOTHING`
  );
  const deleteFollow = db.prepare("DELETE FROM organization_follows WHERE user_id = ? AND organizer_id = ?");
  const writeAudit = db.prepare(
    `INSERT INTO sponsor_slot_audit (id, organizer_id, payload, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, created_at = excluded.created_at`
  );

  db.transaction(() => {
    const existingIds = (db.prepare("SELECT id FROM organizer_profiles").all() as { id: string }[]).map((row) => row.id);
    existingIds.filter((id) => !ids.has(id)).forEach((id) => deleteProfile.run(id));

    profiles.forEach((profile) => {
      upsert.run({
        id: profile.id,
        handle: profile.handle,
        name: profile.name,
        normalizedName: normalizeOrgName(profile.name),
        savedByViewer: profile.savedByViewer ? 1 : 0,
        payload: stringifyJson(profile),
        updatedAt: now
      });

      profile.sponsorSlotAudit?.forEach((entry) => {
        writeAudit.run(entry.id, profile.id, stringifyJson(entry), entry.createdAt);
      });

      if (session?.id) {
        if (profile.savedByViewer) writeFollow.run(session.id, profile.id, now);
        else deleteFollow.run(session.id, profile.id);
      }
    });
  })();

  return readOrganizerLedger(session);
}

export function applyOrganizerLedgerPatch(
  profiles: OrganizerImpactProfile[],
  patch: OrganizerLedgerPatch,
  now = new Date(),
  sessionRoles?: OrganizerPermissionRole[]
) {
  if (patch.profiles) return patch.profiles;

  let next = profiles;

  if (patch.profile) {
    next = upsertProfile(next, patch.profile);
  }

  if (patch.profileUpdate) {
    assertRole(patch.profileUpdate.actorRole, ["organizer_editor", "handprint_reviewer"], "profile editing", sessionRoles);
    const { actorRole: _actorRole, ...profileUpdate } = patch.profileUpdate;
    next = next.map((profile) => (profile.id === profileUpdate.id ? { ...profile, ...profileUpdate } : profile));
  }

  if (patch.followUpdate) {
    next = next.map((profile) =>
      profile.id === patch.followUpdate?.organizerId || profile.handle === patch.followUpdate?.organizerId
        ? { ...profile, savedByViewer: patch.followUpdate.savedByViewer }
        : profile
    );
  }

  if (patch.sponsorSlotUpdate) {
    assertRole(patch.sponsorSlotUpdate.actorRole, ["handprint_reviewer"], "sponsor slot controls", sessionRoles);
    next = next.map((profile) => {
      if (profile.id !== patch.sponsorSlotUpdate?.organizerId) return profile;
      const nextUsed = Math.max(0, patch.sponsorSlotUpdate.sponsorSlotsUsed);
      const nextLimit = Math.max(0, patch.sponsorSlotUpdate.sponsorSlotsLimit);
      return {
        ...profile,
        sponsorSlotsUsed: nextUsed,
        sponsorSlotsLimit: nextLimit,
        sponsorSlotAudit: [
          {
            id: `sponsor-audit-${now.getTime()}`,
            createdAt: now.toISOString(),
            author: "Handprint Review",
            authorRole: "handprint_reviewer",
            previousUsed: profile.sponsorSlotsUsed,
            nextUsed,
            previousLimit: profile.sponsorSlotsLimit,
            nextLimit,
            note: patch.sponsorSlotUpdate.note ?? "Sponsor slot controls updated."
          },
          ...(profile.sponsorSlotAudit ?? [])
        ]
      };
    });
  }

  if (patch.impactReceiptUpdate) {
    assertRole(patch.impactReceiptUpdate.actorRole, ["organizer_editor", "handprint_reviewer"], "impact receipt issuing", sessionRoles);
    next = next.map((profile) =>
      profile.id === patch.impactReceiptUpdate?.organizerId
        ? {
            ...profile,
            impactReceiptIds: Array.from(new Set([...profile.impactReceiptIds, patch.impactReceiptUpdate.receiptId]))
          }
        : profile
    );
  }

  if (patch.reviewNote) {
    assertRole(patch.reviewNote.actorRole, ["handprint_reviewer"], "trust review notes", sessionRoles);
    const note = createReviewNote(patch.reviewNote.note, patch.reviewNote.status ?? "info", now);
    next = next.map((profile) =>
      profile.id === patch.reviewNote?.organizerId ? { ...profile, reviewNotes: [note, ...(profile.reviewNotes ?? [])] } : profile
    );
  }

  if (patch.accoladeUpdate) {
    assertRole(patch.accoladeUpdate.actorRole, ["handprint_reviewer"], "accolade approval", sessionRoles);
    const note = createReviewNote(
      patch.accoladeUpdate.note ?? `Accolade moved to ${patch.accoladeUpdate.status.replaceAll("_", " ")}.`,
      patch.accoladeUpdate.status === "approved" ? "approved" : "hold",
      now
    );
    next = next.map((profile) => {
      if (profile.id !== patch.accoladeUpdate?.organizerId) return profile;
      return {
        ...profile,
        accolades: profile.accolades.map((accolade) =>
          accolade.id === patch.accoladeUpdate?.accoladeId
            ? {
                ...accolade,
                status: patch.accoladeUpdate.status,
                reviewHistory: [note, ...(accolade.reviewHistory ?? [])]
              }
            : accolade
        ),
        reviewNotes: [note, ...(profile.reviewNotes ?? [])]
      };
    });
  }

  return next;
}

export async function readOrganizationReviewQueue(): Promise<OrganizationReviewQueueItem[]> {
  const db = getHandprintDatabase();
  return (
    db
      .prepare("SELECT payload FROM organization_review_queue ORDER BY created_at DESC")
      .all() as { payload: string }[]
  ).map((row) => parseJson<OrganizationReviewQueueItem>(row.payload));
}

export async function recordOrganizationSubmissionReview(profile: OrganizerImpactProfile, existingProfiles: OrganizerImpactProfile[]) {
  const duplicate = findDuplicateOrganizer(existingProfiles, profile.name);
  const now = new Date().toISOString();
  const status: OrganizationReviewQueueItem["status"] = duplicate && duplicate.id !== profile.id ? "possible_duplicate" : "needs_review";
  const item: OrganizationReviewQueueItem = {
    id: `org-review-${profile.id}`,
    submittedName: profile.name,
    normalizedName: normalizeOrgName(profile.name),
    duplicateOfId: duplicate?.id !== profile.id ? duplicate?.id : undefined,
    duplicateOfName: duplicate?.id !== profile.id ? duplicate?.name : undefined,
    status,
    reason:
      status === "possible_duplicate"
        ? `Submitted organizer resembles ${duplicate?.name}. Reviewer should merge, approve, or separate it.`
        : "New organizer profile created by submission and waiting for Handprint review.",
    createdAt: now
  };
  const db = getHandprintDatabase();
  db.prepare(
    `INSERT INTO organization_review_queue (id, submitted_name, normalized_name, duplicate_of_id, duplicate_of_name, status, reason, payload, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       duplicate_of_id = excluded.duplicate_of_id,
       duplicate_of_name = excluded.duplicate_of_name,
       status = excluded.status,
       reason = excluded.reason,
       payload = excluded.payload`
  ).run(
    item.id,
    item.submittedName,
    item.normalizedName,
    item.duplicateOfId ?? null,
    item.duplicateOfName ?? null,
    item.status,
    item.reason,
    stringifyJson(item),
    item.createdAt
  );
  return item;
}

export function findOrganizerByPublicId(profiles: OrganizerImpactProfile[], organizerId?: string) {
  const normalized = normalizeOrgName(organizerId ?? "");
  return profiles.find((organizer) => organizer.id === organizerId || organizer.handle === organizerId || normalizeOrgName(organizer.name) === normalized);
}

export function findDuplicateOrganizer(profiles: OrganizerImpactProfile[], name: string) {
  const normalized = normalizeOrgName(name);
  return profiles.find((organizer) => {
    const candidate = normalizeOrgName(organizer.name);
    return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate) || hasStrongTokenOverlap(candidate, normalized);
  });
}

export function normalizeOrgName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(
      /\b(the|inc|incorporated|llc|corp|corporation|company|co|nonprofit|non-profit|organization|org|foundation|association|center|centre|church|ministries|ministry|services|service)\b/g,
      ""
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function hasStrongTokenOverlap(candidate: string, normalized: string) {
  const candidateTokens = new Set(candidate.split(" ").filter((token) => token.length > 2));
  const normalizedTokens = new Set(normalized.split(" ").filter((token) => token.length > 2));
  if (candidateTokens.size < 2 || normalizedTokens.size < 2) return false;
  const shared = Array.from(normalizedTokens).filter((token) => candidateTokens.has(token)).length;
  const smallest = Math.min(candidateTokens.size, normalizedTokens.size);
  return shared >= 2 && shared / smallest >= 0.66;
}

function upsertProfile(profiles: OrganizerImpactProfile[], profile: OrganizerImpactProfile) {
  const duplicate = findDuplicateOrganizer(profiles, profile.name);
  if (!duplicate) return [profile, ...profiles];
  return profiles.map((item) =>
    item.id === duplicate.id
      ? {
          ...item,
          ...profile,
          id: item.id,
          handle: item.handle,
          featuredEventIds: Array.from(new Set([...profile.featuredEventIds, ...item.featuredEventIds])),
          impactReceiptIds: Array.from(new Set([...profile.impactReceiptIds, ...item.impactReceiptIds])),
          accolades: profile.accolades.length ? profile.accolades : item.accolades
        }
      : item
  );
}

function createReviewNote(note: string, status: TrustReviewNote["status"], now: Date): TrustReviewNote {
  return {
    id: `trust-note-${now.getTime()}`,
    createdAt: now.toISOString(),
    author: "Handprint Review",
    note,
    status
  };
}

function assertRole(
  role: OrganizerPermissionRole | undefined,
  allowedRoles: OrganizerPermissionRole[],
  action: string,
  sessionRoles?: OrganizerPermissionRole[]
) {
  if (sessionRoles) {
    if (allowedRoles.some((allowedRole) => sessionRoles.includes(allowedRole))) return;
    throw new Error(`Permission denied for ${action}. Required role: ${allowedRoles.join(" or ")}.`);
  }
  if (role && allowedRoles.includes(role)) return;
  throw new Error(`Permission denied for ${action}. Required role: ${allowedRoles.join(" or ")}.`);
}

function seedOrganizerProfilesIfNeeded() {
  const db = getHandprintDatabase();
  const count = (db.prepare("SELECT COUNT(*) AS count FROM organizer_profiles").get() as { count: number }).count;
  if (count > 0) return;
  const seedProfiles = loadLegacyProfiles();
  const now = new Date().toISOString();
  const insertProfile = db.prepare(
    `INSERT INTO organizer_profiles (id, handle, name, normalized_name, saved_by_viewer, payload, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertFollow = db.prepare(
    `INSERT INTO organization_follows (user_id, organizer_id, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, organizer_id) DO NOTHING`
  );
  db.transaction(() => {
    seedProfiles.forEach((profile) => {
      insertProfile.run(profile.id, profile.handle, profile.name, normalizeOrgName(profile.name), profile.savedByViewer ? 1 : 0, stringifyJson(profile), now);
      if (profile.savedByViewer) insertFollow.run("session-dan-pilot", profile.id, now);
    });
  })();
}

function loadLegacyProfiles() {
  try {
    const ledger = readFileSync(organizerLedgerPath, "utf8");
    const parsed = JSON.parse(ledger) as OrganizerLedger;
    if (parsed.profiles?.length) return parsed.profiles;
  } catch {
    return initialOrganizerImpactProfiles;
  }
  return initialOrganizerImpactProfiles;
}

function latestOrganizerUpdate() {
  const db = getHandprintDatabase();
  const row = db.prepare("SELECT MAX(updated_at) AS lastUpdatedAt FROM organizer_profiles").get() as { lastUpdatedAt: string | null };
  return row.lastUpdatedAt ?? new Date().toISOString();
}
