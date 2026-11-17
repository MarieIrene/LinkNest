import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { attachSession } from "@/lib/auth";
import { isUniqueViolation, jsonError, readJson, zodFields } from "@/lib/api";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  }
  const { email, username, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    const fields: Record<string, string> = {};
    if (existing.email === email) fields.email = "An account with this email already exists. Log in instead.";
    if (existing.username === username) fields.username = "That username is taken. Try another.";
    return jsonError("Some details are already in use.", 409, fields);
  }

  try {
    const user = await prisma.user.create({
      data: { email, username, displayName: username, passwordHash: await bcrypt.hash(password, 12) },
      select: { id: true },
    });
    return attachSession(NextResponse.json({ ok: true }, { status: 201 }), user.id);
  } catch (err) {
    if (isUniqueViolation(err)) return jsonError("That email or username was just taken. Try another.", 409);
    throw err;
  }
}
