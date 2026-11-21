import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordReset } from "@/lib/password-reset";

/**
 * Emails a password reset link. Always answers the same way whether or not the
 * email has an account, so nobody can use this form to find out who is registered.
 */
export async function POST(req: Request) {
  const parsed = forgotPasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, displayName: true, username: true },
  });
  if (user && (await sendPasswordReset(user)) === "failed") {
    return jsonError("We couldn't send the email right now. Try again in a few minutes.", 502);
  }
  return NextResponse.json({ ok: true });
}
