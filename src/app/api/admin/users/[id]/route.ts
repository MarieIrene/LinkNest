import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { isAdminEmail } from "@/lib/site";

type Ctx = { params: Promise<{ id: string }> };

/** Admins can't suspend or delete themselves or another admin. */
async function loadTarget(id: string, adminId: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, username: true } });
  if (!user) return { error: jsonError("That account no longer exists.", 404) };
  if (user.id === adminId) return { error: jsonError("You can't do this to your own account.", 400) };
  if (isAdminEmail(user.email)) return { error: jsonError("This account belongs to an admin. Remove it from ADMIN_EMAILS first.", 400) };
  return { user };
}

/** Admin: suspend or restore an account. A suspended account's public page and card link show "unavailable". */
export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await getAdmin();
  if (!admin) return jsonError("Page not found.", 404);
  const { id } = await params;

  const parsed = z.object({ suspended: z.boolean() }).safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));

  const target = await loadTarget(id, admin.id);
  if (target.error) return target.error;

  const user = await prisma.user.update({
    where: { id },
    data: { suspended: parsed.data.suspended },
    select: { id: true, suspended: true },
  });
  return NextResponse.json({ user });
}

/** Admin: permanently delete an account and its links. The admin must type the username to confirm. */
export async function DELETE(req: Request, { params }: Ctx) {
  const admin = await getAdmin();
  if (!admin) return jsonError("Page not found.", 404);
  const { id } = await params;

  const target = await loadTarget(id, admin.id);
  if (target.error) return target.error;

  const parsed = z.object({ confirmUsername: z.string() }).safeParse(await readJson(req));
  if (!parsed.success || parsed.data.confirmUsername.trim().toLowerCase() !== target.user.username) {
    return jsonError("Type the username exactly to confirm.", 400, { confirmUsername: "That doesn't match the username." });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
