import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cardCodeUrl } from "@/lib/cards";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { formatDate, formatDateTime } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { CardControls } from "@/components/cards/CardForms";
import { CardQr, CardStatusBadge } from "@/components/cards/CardBits";
import { NfcWriter } from "@/components/cards/NfcWriter";

export const metadata: Metadata = { title: "Card" };

export default async function AdminCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id },
    select: {
      id: true, code: true, type: true, label: true, status: true, taps: true, lastTapAt: true, createdAt: true,
      user: { select: { id: true, username: true, displayName: true, email: true, avatarUrl: true } },
    },
  });
  if (!card) notFound();

  const url = cardCodeUrl(card.code);
  const product = PRODUCTS[card.type as ProductId]?.name ?? card.type;

  return (
    <>
      <Link href="/admin/cards" className="mb-4 inline-block text-sm font-medium text-primary hover:underline">&larr; All cards</Link>
      <PageHeader
        title={`Card ${card.code}`}
        description={`${product}${card.label ? ` · ${card.label}` : ""} · created ${formatDate(card.createdAt)}`}
        actions={<CardStatusBadge status={card.status} assigned={Boolean(card.user)} />}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4">
            <li><StatCard label="Taps" value={card.taps.toLocaleString()} icon="tap" tone="violet" /></li>
            <li><StatCard label="Last tap" value={card.lastTapAt ? formatDate(card.lastTapAt) : "Never"} sub={card.lastTapAt ? formatDateTime(card.lastTapAt).split(", ")[1] : undefined} icon="eye" tone="teal" /></li>
          </ul>

          <Card id="owner" title="Owner">
            {card.user ? (
              <Link href={`/admin/users/${card.user.id}`} className="mb-5 flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-paper">
                <Avatar name={card.user.displayName || card.user.username} src={card.user.avatarUrl} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{card.user.displayName || card.user.username}</p>
                  <p className="truncate text-sm text-ink/60">@{card.user.username} · {card.user.email}</p>
                </div>
              </Link>
            ) : (
              <p className="mb-5 rounded-xl bg-paper px-4 py-3 text-ink/70">
                Not given to anyone yet. Tapping it shows &ldquo;This card hasn&apos;t been set up yet&rdquo;.
              </p>
            )}
            <CardControls cardId={card.id} status={card.status} owner={card.user} label={card.label} />
          </Card>

          <Card id="write" title="Write this card" description="Put the card's address onto the NFC chip. You can rewrite an unlocked card any time.">
            <NfcWriter url={url} cardLabel={`card ${card.code}`} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card id="address" title="Card address" description="What's written on the chip">
            <p className="break-all rounded-xl border border-line bg-paper px-4 py-3 font-mono text-sm text-primary">{url}</p>
            <p className="mt-3 text-sm text-ink/60">The card never needs rewriting when the owner changes their profile or username.</p>
          </Card>
          <Card id="qr" title="QR code" description="Print it on the back of the card for phones without NFC">
            <CardQr id={card.code} size={200} />
          </Card>
        </div>
      </div>
    </>
  );
}
