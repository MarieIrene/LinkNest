import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { jsonError, readJson, unauthorized, zodFields } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validations";

/** Signed-in user changes their own password. They must know the current one. */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const parsed = changePasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) return unauthorized();

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return jsonError("Check the highlighted fields.", 400, { currentPassword: "That's not your current password." });
  }
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    return jsonError("Check the highlighted fields.", 400, { newPassword: "Choose a password different from your current one." });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } }),
    // Any "forgot password" links still in someone's inbox stop working.
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
  ]);
  return NextResponse.json({ ok: true });
}
