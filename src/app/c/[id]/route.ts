import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * NFC cards and tags are programmed with this address. When a phone taps the card it
 * shows a notification for this link; opening it lands here, we count the tap and send
 * the visitor to the card owner's current profile page.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user
    .update({ where: { id }, data: { cardTaps: { increment: 1 } }, select: { username: true } })
    .catch(() => null);
  if (!user) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.redirect(new URL(`/${user.username}`, req.url), 302);
}
