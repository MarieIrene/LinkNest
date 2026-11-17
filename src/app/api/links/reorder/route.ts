import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { jsonError, readJson, unauthorized } from "@/lib/api";
import { reorderSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const parsed = reorderSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Send the full list of link ids in their new order.");
  const { ids } = parsed.data;

  const owned = await prisma.link.findMany({ where: { userId }, select: { id: true } });
  const ownedIds = new Set(owned.map((l) => l.id));
  const isSameSet =
    ids.length === ownedIds.size && new Set(ids).size === ids.length && ids.every((id) => ownedIds.has(id));
  if (!isSameSet) {
    return jsonError("Your link list is out of date. Refresh the page and try again.", 409);
  }

  await prisma.$transaction(
    ids.map((id, position) => prisma.link.update({ where: { id }, data: { position } })),
  );
  return NextResponse.json({ ok: true });
}
