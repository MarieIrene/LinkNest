import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CARD_CODE_PATTERN, normalizeCardCode } from "@/lib/cards";

export const dynamic = "force-dynamic";

/**
 * Every NFC card and QR code points here. Two kinds of address:
 *  - /c/A7K2QX : a physical card's short code (Cards in the admin panel)
 *  - /c/<user id> : the personal card link every account has had from the start
 * We count the tap and send the visitor to the owner's current profile page.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url), 302);

  const code = normalizeCardCode(id);
  if (CARD_CODE_PATTERN.test(code)) {
    const card = await prisma.card.findUnique({
      where: { code },
      select: { id: true, status: true, user: { select: { id: true, username: true } } },
    });
    if (card) {
      if (card.status !== "active") return go("/card?state=off");
      if (!card.user) return go(`/card?state=new&code=${code}`);
      // Counting must never stop the profile from opening.
      await prisma
        .$transaction([
          prisma.card.update({ where: { id: card.id }, data: { taps: { increment: 1 }, lastTapAt: new Date() } }),
          prisma.user.update({ where: { id: card.user.id }, data: { cardTaps: { increment: 1 } } }),
        ])
        .catch(() => undefined);
      return go(`/${card.user.username}`);
    }
  }

  const user = await prisma.user
    .update({ where: { id }, data: { cardTaps: { increment: 1 } }, select: { username: true } })
    .catch(() => null);
  return user ? go(`/${user.username}`) : go("/card?state=unknown");
}
