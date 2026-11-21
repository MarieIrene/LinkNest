import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { BOOKING_STATUS_IDS } from "@/lib/bookings";

const updateBookingSchema = z.object({
  status: z.enum(BOOKING_STATUS_IDS).optional(),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters.").optional(),
});

/** Admin: change a booking's status or staff notes. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return jsonError("Page not found.", 404);
  const { id } = await params;

  const parsed = updateBookingSchema.safeParse(await readJson(req));
  if (!parsed.success) return jsonError("Check the highlighted fields.", 400, zodFields(parsed.error));
  const { status, notes } = parsed.data;

  const booking = await prisma.booking
    .update({
      where: { id },
      data: { status, notes: notes === undefined ? undefined : notes || null },
      select: { id: true, status: true, notes: true, updatedAt: true },
    })
    .catch(() => null);
  if (!booking) return jsonError("That booking no longer exists.", 404);
  return NextResponse.json({ booking });
}
