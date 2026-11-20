import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { isAdminEmail } from "@/lib/site";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Card bookings" };
export const dynamic = "force-dynamic";

/** Staff-only list of card orders from the landing page. Access: ADMIN_EMAILS. */
export default async function BookingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user || !isAdminEmail(user.email)) notFound();

  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Logo />
          <Link href="/dashboard" className="btn-ghost ml-auto">Back to dashboard</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-primary">Card bookings</h1>
        <p className="mt-1 text-ink/65">Newest first. Call each customer to set up their account and prepare the card.</p>

        {bookings.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line px-5 py-8 text-center text-ink/65">
            No bookings yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-primary-soft text-primary">
                <tr>
                  {["Date", "Product", "Qty", "Name", "Phone", "Email", "Note"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                      {b.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 font-medium">{PRODUCTS[b.product as ProductId]?.name ?? b.product}</td>
                    <td className="px-4 py-3">{b.quantity}</td>
                    <td className="px-4 py-3">{b.name}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="text-primary underline-offset-2 hover:underline">{b.phone}</a>
                    </td>
                    <td className="px-4 py-3">
                      {b.email ? <a href={`mailto:${b.email}`} className="text-primary underline-offset-2 hover:underline">{b.email}</a> : "—"}
                    </td>
                    <td className="max-w-[28ch] px-4 py-3 text-ink/75">{b.message ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
