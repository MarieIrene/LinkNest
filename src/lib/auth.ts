import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { SESSION_COOKIE, readSession, sessionCookieOptions, signSession } from "./session-token";

/** Returns the signed-in user's id, or null. */
export async function getCurrentUserId() {
  const store = await cookies();
  return readSession(store.get(SESSION_COOKIE)?.value);
}

export async function attachSession(res: NextResponse, userId: string) {
  res.cookies.set(SESSION_COOKIE, await signSession(userId), sessionCookieOptions);
  return res;
}

export function removeSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
