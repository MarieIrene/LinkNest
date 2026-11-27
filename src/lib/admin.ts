import "server-only";
import { notFound, redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getCurrentUserId } from "./auth";
import { isAdminEmail } from "./site";

/** The signed-in admin, or null for visitors and normal users. */
export async function getAdmin() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, displayName: true },
  });
  return user && isAdminEmail(user.email) ? user : null;
}

/** For admin pages: visitors go to log in, normal users get "page not found". */
export async function requireAdminPage(from = "/admin") {
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/login?next=${encodeURIComponent(from)}`);
  const admin = await getAdmin();
  if (!admin) notFound();
  return admin;
}

/** Finds a user by username (with or without @) or by login email. */
export async function findUserByHandle(handle: string) {
  const h = handle.trim().toLowerCase().replace(/^@/, "");
  if (!h) return null;
  return prisma.user.findFirst({ where: { OR: [{ username: h }, { email: h }] }, select: { id: true, username: true } });
}
