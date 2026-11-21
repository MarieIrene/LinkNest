import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import { jsonError } from "@/lib/api";
import { sendPasswordReset } from "@/lib/password-reset";

/** Admin: email a customer a one-time link to choose a new password. The admin never sees the password. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return jsonError("Page not found.", 404);
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, displayName: true, username: true },
  });
  if (!user) return jsonError("That account no longer exists.", 404);

  const result = await sendPasswordReset(user, { requestedByAdmin: true });
  if (result === "cooldown") return jsonError("A reset email was sent less than a minute ago. Wait a moment before sending another.", 429);
  if (result === "failed") return jsonError("We couldn't send the email. Check the email settings (GMAIL_USER and GMAIL_APP_PASSWORD).", 502);
  return NextResponse.json({ ok: true, email: user.email });
}
