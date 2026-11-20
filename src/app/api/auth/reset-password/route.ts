import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { attachSession } from "@/lib/auth";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validations";
import { hashResetToken } from "@/lib/password-reset";

const EXPIRED = "This reset link has expired or was already used. Ask for a new one.";

/** Sets a new password from a valid reset link, then logs the person in. */
export async function POST(req: Request) {
  const parsed = resetPasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    const fields = zodFields(parsed.error);
    if (fields.token) return jsonError(EXPIRED, 400);
    return jsonError("Check the highlighted fields.", 400, fields);
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(parsed.data.token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) return jsonError(EXPIRED, 400);

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  // Mark the link used only if nobody used it in the meantime, then change the password.
  const claimed = await prisma.passwordResetToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) return jsonError(EXPIRED, 400);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, id: { not: record.id } } }),
  ]);

  return attachSession(NextResponse.json({ ok: true }), record.userId);
}
