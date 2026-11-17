import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { jsonError, readJson, unauthorized, zodFields } from "@/lib/api";
import { createLinkSchema } from "@/lib/validations";

const linkSelect = { id: true, title: true, url: true, isActive: true, clicks: true, position: true };

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    select: linkSelect,
  });
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const parsed = createLinkSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  }

  const last = await prisma.link.findFirst({
    where: { userId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const link = await prisma.link.create({
    data: { ...parsed.data, userId, position: (last?.position ?? -1) + 1 },
    select: linkSelect,
  });
  return NextResponse.json({ link }, { status: 201 });
}
