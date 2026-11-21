import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { APP_NAME, APP_URL } from "./site";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** A random token for the email link, plus the hash we store (so a database leak can't be used to reset passwords). */
export function createResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const RESEND_COOLDOWN_MS = 60 * 1000;

type ResetUser = { id: string; email: string; displayName: string | null; username: string };

/**
 * Creates a fresh one-time link (older links stop working) and emails it.
 * Returns "cooldown" if a link was sent less than a minute ago.
 */
export async function sendPasswordReset(user: ResetUser, opts: { requestedByAdmin?: boolean } = {}) {
  const recent = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    select: { id: true },
  });
  if (recent) return "cooldown" as const;

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  const { token, tokenHash } = createResetToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  const link = `${APP_URL}/reset-password?token=${token}`;
  const name = user.displayName || user.username;
  const why = opts.requestedByAdmin
    ? `The ${APP_NAME} team sent you this link so you can choose a new password.`
    : `Someone asked to reset the password for your ${APP_NAME} account.`;
  const sent = await sendEmail({
    to: user.email,
    subject: `Reset your ${APP_NAME} password`,
    text: `Hi ${name},

${why} To choose a new password, open this link within 1 hour:

${link}

If you didn't ask for this, you can ignore this email. Your password won't change.

${APP_NAME}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;color:#0B2F3B">
  <h2 style="color:#164E63">Reset your ${APP_NAME} password</h2>
  <p>Hi ${escapeHtml(name)},</p>
  <p>${escapeHtml(why)} This link works for 1 hour.</p>
  <p><a href="${link}" style="display:inline-block;background:#5EEAD4;color:#0E3443;padding:12px 22px;border-radius:999px;font-weight:bold;text-decoration:none">Choose a new password</a></p>
  <p style="font-size:13px;color:#4b6670">If you didn't ask for this, you can ignore this email. Your password won't change.</p>
</div>`,
  });
  return sent ? ("sent" as const) : ("failed" as const);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
