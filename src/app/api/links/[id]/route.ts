import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { jsonError, readJson, unauthorized, zodFields } from "@/lib/api";
import { updateLinkSchema } from "@/lib/validations";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const parsed = updateLinkSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  }

  // updateMany with userId makes sure people can only edit their own links.
  const result = await prisma.link.updateMany({ where: { id, userId }, data: parsed.data });
  if (result.count === 0) return jsonError("That link no longer exists.", 404);

  const link = await prisma.link.findUnique({
    where: { id },
    select: { id: true, title: true, url: true, platform: true, isActive: true, clicks: true, position: true },
  });
  return NextResponse.json({ link });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const result = await prisma.link.deleteMany({ where: { id, userId } });
  if (result.count === 0) return jsonError("That link no longer exists.", 404);
  return NextResponse.json({ ok: true });
}
