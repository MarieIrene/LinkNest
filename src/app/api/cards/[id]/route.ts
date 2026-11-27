import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { jsonError, readJson, unauthorized } from "@/lib/api";

/**
 * A card owner reports their card lost: it's switched off straight away, so a finder can't
 * use it. Turning it back on is done by LinkNest staff, who can check the person has it again.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();
  const { id } = await params;

  const parsed = z.object({ status: z.literal("disabled") }).safeParse(await readJson(req));
  if (!parsed.success) return jsonError("You can only switch off your card here. Call us to switch it back on.", 400);

  const result = await prisma.card.updateMany({ where: { id, userId }, data: { status: "disabled" } });
  if (result.count === 0) return jsonError("That card isn't on your account.", 404);
  return NextResponse.json({ ok: true });
}
