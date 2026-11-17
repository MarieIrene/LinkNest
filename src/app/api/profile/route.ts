import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { isUniqueViolation, jsonError, readJson, unauthorized, zodFields } from "@/lib/api";
import { profileSchema } from "@/lib/validations";

const profileSelect = {
  email: true, username: true, displayName: true, bio: true, avatarUrl: true, views: true,
};

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const profile = await prisma.user.findUnique({ where: { id: userId }, select: profileSelect });
  if (!profile) return unauthorized();
  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const parsed = profileSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  }
  const { username, displayName, bio, avatarUrl } = parsed.data;

  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: userId } },
      select: { id: true },
    });
    if (taken) return jsonError("Some details are already in use.", 409, { username: "That username is taken. Try another." });
  }

  try {
    const profile = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        displayName: displayName === undefined ? undefined : displayName || null,
        bio: bio === undefined ? undefined : bio || null,
        avatarUrl: avatarUrl === undefined ? undefined : avatarUrl || null,
      },
      select: profileSelect,
    });
    return NextResponse.json({ profile });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return jsonError("Some details are already in use.", 409, { username: "That username is taken. Try another." });
    }
    throw err;
  }
}
