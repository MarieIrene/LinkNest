import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { findUserByHandle, getAdmin } from "@/lib/admin";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { generateCardCode } from "@/lib/cards";
import { PRODUCT_IDS } from "@/lib/products";

const createCardsSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Create at least 1 card.").max(200, "Create at most 200 cards at a time."),
  type: z.enum(PRODUCT_IDS),
  label: z.string().trim().max(80, "Keep the note under 80 characters.").optional(),
  /** Optional: give the new cards straight to this person (username or login email). */
  assignTo: z.string().trim().max(120).optional(),
});

/** Admin: create a batch of new cards, each with its own unique short code. */
export async function POST(req: Request) {
  if (!(await getAdmin())) return jsonError("Page not found.", 404);
  const parsed = createCardsSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  const { quantity, type, label, assignTo } = parsed.data;

  let userId: string | null = null;
  if (assignTo) {
    const user = await findUserByHandle(assignTo);
    if (!user) return jsonError("Check the highlighted fields.", 400, { assignTo: "No account has that username or email." });
    userId = user.id;
  }

  // Codes are random; on the rare clash with an existing code, just try another.
  const codes = new Set<string>();
  while (codes.size < quantity) codes.add(generateCardCode());
  const taken = await prisma.card.findMany({ where: { code: { in: [...codes] } }, select: { code: true } });
  for (const { code } of taken) {
    codes.delete(code);
    let fresh = generateCardCode();
    while (codes.has(fresh)) fresh = generateCardCode();
    codes.add(fresh);
  }

  await prisma.card.createMany({ data: [...codes].map((code) => ({ code, type, label: label || null, userId })) });
  const cards = await prisma.card.findMany({ where: { code: { in: [...codes] } }, select: { id: true, code: true } });
  return NextResponse.json({ cards }, { status: 201 });
}
