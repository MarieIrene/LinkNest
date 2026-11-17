import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { attachSession } from "@/lib/auth";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { loginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true },
  });
  const valid = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    return jsonError("Email or password is incorrect.", 401);
  }

  return attachSession(NextResponse.json({ ok: true }), user.id);
}
