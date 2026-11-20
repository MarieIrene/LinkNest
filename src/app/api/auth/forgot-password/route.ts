import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations";
import { createResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { sendEmail } from "@/lib/email";
import { APP_NAME, APP_URL } from "@/lib/site";

const RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * Emails a password reset link. Always answers the same way whether or not the
 * email has an account, so nobody can use this form to find out who is registered.
 */
export async function POST(req: Request) {
  const parsed = forgotPasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  }
  const ok = NextResponse.json({ ok: true });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, displayName: true, username: true },
  });
  if (!user) return ok;

  // Don't send another email if one went out a moment ago (double clicks, abuse).
  const recent = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    select: { id: true },
  });
  if (recent) return ok;

  // Only the newest link works.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const { token, tokenHash } = createResetToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  const link = `${APP_URL}/reset-password?token=${token}`;
  const name = user.displayName || user.username;
  const sent = await sendEmail({
    to: user.email,
    subject: `Reset your ${APP_NAME} password`,
    text: `Hi ${name},\n\nSomeone asked to reset the password for your ${APP_NAME} account. To choose a new password, open this link within 1 hour:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email. Your password won't change.\n\n${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;color:#0B2F3B">
  <h2 style="color:#164E63">Reset your ${APP_NAME} password</h2>
  <p>Hi ${escapeHtml(name)},</p>
  <p>Someone asked to reset the password for your ${APP_NAME} account. This link works for 1 hour.</p>
  <p><a href="${link}" style="display:inline-block;background:#5EEAD4;color:#0E3443;padding:12px 22px;border-radius:999px;font-weight:bold;text-decoration:none">Choose a new password</a></p>
  <p style="font-size:13px;color:#4b6670">If you didn't ask for this, you can ignore this email. Your password won't change.</p>
</div>`,
  });
  if (!sent) return jsonError("We couldn't send the email right now. Try again in a few minutes.", 502);
  return ok;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
