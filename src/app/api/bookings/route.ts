import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, zodFields } from "@/lib/api";
import { bookingSchema } from "@/lib/validations";

/** Public: a visitor asks to order a smart card or social media tag. */
export async function POST(req: Request) {
  const parsed = bookingSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    const fields = zodFields(parsed.error);
    // A filled honeypot means a bot. Pretend it worked so it doesn't retry.
    if (fields.company) return NextResponse.json({ ok: true }, { status: 201 });
    return jsonError("Check the highlighted fields.", 400, fields);
  }

  const { product, quantity, name, phone, email, message } = parsed.data;
  await prisma.booking.create({
    data: { product, quantity, name, phone, email: email || null, message: message || null },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
