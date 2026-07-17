import { NextResponse } from "next/server";
import { type OrganizerPermissionRole } from "@/lib/handprint-data";
import { getHandprintDatabase, parseJson, stringifyJson } from "@/lib/server/database";

export type HandprintSession = {
  id: string;
  displayName: string;
  activeProfileHandle: string;
  roles: OrganizerPermissionRole[];
};

const cookieName = "handprint_session";
const defaultSessionId = "session-dan-pilot";
const defaultRoles: OrganizerPermissionRole[] = ["organizer_editor", "handprint_reviewer"];

type SessionRow = {
  id: string;
  display_name: string;
  roles_json: string;
  active_profile_handle: string;
};

export function readSession(request: Request): HandprintSession {
  const sessionId = getCookie(request, cookieName) ?? defaultSessionId;
  return ensureSession(sessionId);
}

export function createSession(mode: "viewer" | "organizer_editor" | "handprint_reviewer" | "pilot_admin" = "pilot_admin") {
  const roles: OrganizerPermissionRole[] =
    mode === "viewer" ? [] : mode === "pilot_admin" ? defaultRoles : [mode];
  return ensureSession(`session-dan-${mode}`, roles);
}

export function sessionCookie(session: HandprintSession) {
  return `${cookieName}=${session.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
}

export function attachSessionCookie(response: NextResponse, session: HandprintSession) {
  response.headers.append("Set-Cookie", sessionCookie(session));
  return response;
}

export function requireAnyRole(session: HandprintSession, allowedRoles: OrganizerPermissionRole[], action: string) {
  if (allowedRoles.some((role) => session.roles.includes(role))) return;
  throw new Error(`Permission denied for ${action}. Required role: ${allowedRoles.join(" or ")}.`);
}

function ensureSession(sessionId: string, roles = defaultRoles): HandprintSession {
  const db = getHandprintDatabase();
  const now = new Date().toISOString();
  const row = db
    .prepare("SELECT id, display_name, roles_json, active_profile_handle FROM user_sessions WHERE id = ?")
    .get(sessionId) as SessionRow | undefined;

  if (!row) {
    db.prepare(
      `INSERT INTO user_sessions (id, display_name, roles_json, active_profile_handle, created_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(sessionId, "Dan", stringifyJson(roles), "dan", now, now);
    return {
      id: sessionId,
      displayName: "Dan",
      activeProfileHandle: "dan",
      roles
    };
  }

  db.prepare("UPDATE user_sessions SET last_seen_at = ? WHERE id = ?").run(now, sessionId);
  return {
    id: row.id,
    displayName: row.display_name,
    activeProfileHandle: row.active_profile_handle,
    roles: parseJson<OrganizerPermissionRole[]>(row.roles_json)
  };
}

function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
