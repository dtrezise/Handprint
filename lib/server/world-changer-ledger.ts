import { getHandprintDatabase, parseJson, stringifyJson } from "@/lib/server/database";
import type { HandprintSession } from "@/lib/server/session";

export type FollowedWorldChanger = {
  handle: string;
  name: string;
  tier: string;
  focus: string;
  recruiting: string[];
  following: string[];
  points: number;
  savedByViewer: boolean;
};

export type WorldChangerFollowPatch = {
  handle: string;
  savedByViewer: boolean;
  profile?: Partial<FollowedWorldChanger>;
};

const seedWorldChangers: FollowedWorldChanger[] = [
  {
    handle: "maya-rivera",
    name: "Maya Rivera",
    tier: "Builder",
    focus: "Cleanup captain",
    recruiting: ["Riverwalk cleanup sprint", "Community mural prep day"],
    following: ["Friends of the Riverwalk", "Block Studio Cooperative"],
    points: 540,
    savedByViewer: true
  },
  {
    handle: "jordan-lee",
    name: "Jordan Lee",
    tier: "Helper",
    focus: "Pantry recruiting",
    recruiting: ["Saturday food shelf sort", "CCAP/Loaves & Fishes food support shift"],
    following: ["Northside Community Pantry", "CCAP/Loaves & Fishes"],
    points: 330,
    savedByViewer: true
  },
  {
    handle: "sam-patel",
    name: "Sam Patel",
    tier: "Neighbor",
    focus: "Preparedness mentor",
    recruiting: ["Neighborhood preparedness table"],
    following: ["Civic Help Desk"],
    points: 180,
    savedByViewer: true
  }
];

export function readWorldChangerFollows(session: Pick<HandprintSession, "id">) {
  const db = getHandprintDatabase();
  const rows = db
    .prepare("SELECT handle, saved_by_viewer, payload FROM world_changer_follows WHERE user_id = ?")
    .all(session.id) as { handle: string; saved_by_viewer: number; payload: string }[];
  const persisted = new Map(
    rows.map((row) => [
      row.handle,
      {
        ...parseJson<FollowedWorldChanger>(row.payload),
        savedByViewer: row.saved_by_viewer === 1
      }
    ])
  );

  const profiles = seedWorldChangers.map((profile) => persisted.get(profile.handle) ?? profile);
  rows.forEach((row) => {
    if (!profiles.some((profile) => profile.handle === row.handle)) {
      profiles.push(persisted.get(row.handle)!);
    }
  });

  return {
    profiles,
    generatedAt: new Date().toISOString()
  };
}

export function applyWorldChangerFollowPatch(session: Pick<HandprintSession, "id">, patch: WorldChangerFollowPatch) {
  if (!patch.handle) {
    throw new Error("Missing World Changer handle.");
  }

  const current =
    readWorldChangerFollows(session).profiles.find((profile) => profile.handle === patch.handle) ??
    ({
      handle: patch.handle,
      name: patch.profile?.name ?? patch.handle,
      tier: patch.profile?.tier ?? "Starter",
      focus: patch.profile?.focus ?? "World Changer",
      recruiting: patch.profile?.recruiting ?? [],
      following: patch.profile?.following ?? [],
      points: patch.profile?.points ?? 0,
      savedByViewer: patch.savedByViewer
    } satisfies FollowedWorldChanger);
  const now = new Date().toISOString();
  const next: FollowedWorldChanger = {
    ...current,
    ...(patch.profile ?? {}),
    handle: patch.handle,
    savedByViewer: patch.savedByViewer
  };

  getHandprintDatabase()
    .prepare(
      `INSERT INTO world_changer_follows (user_id, handle, saved_by_viewer, payload, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, handle) DO UPDATE SET
         saved_by_viewer = excluded.saved_by_viewer,
         payload = excluded.payload,
         updated_at = excluded.updated_at`
    )
    .run(session.id, patch.handle, patch.savedByViewer ? 1 : 0, stringifyJson(next), now);

  return {
    profile: next,
    profiles: readWorldChangerFollows(session).profiles,
    updatedAt: now
  };
}
