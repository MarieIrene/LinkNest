import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { findUserByHandle, getAdmin } from "@/lib/admin";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { PRODUCT_IDS } from "@/lib/products";

const updateCardSchema = z.object({
  /** Username or email to give the card to; "" takes it back (unassigned). */
  assignTo: z.string().trim().max(120).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  type: z.enum(PRODUCT_IDS).optional(),
  label: z.string().trim().max(80, "Keep the note under 80 characters.").optional(),
});

/** Admin: give a card to someone, take it back, switch it off/on, or edit its note. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return jsonError("Page not found.", 404);
  const { id } = await params;
  const parsed = updateCardSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  const { assignTo, status, type, label } = parsed.data;

  let userId: string | null | undefined;
  if (assignTo !== undefined) {
    if (assignTo === "") userId = null;
    else {
      const user = await findUserByHandle(assignTo);
      if (!user) return jsonError("Check the highlighted fields.", 400, { assignTo: "No account has that username or email." });
      userId = user.id;
    }
  }

  const card = await prisma.card
    .update({
      where: { id },
      data: { userId, status, type, label: label === undefined ? undefined : label || null },
      select: { id: true, code: true, status: true, type: true, label: true, user: { select: { id: true, username: true, displayName: true } } },
    })
    .catch(() => null);
  if (!card) return jsonError("That card no longer exists.", 404);
  return NextResponse.json({ card });
}
