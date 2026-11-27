import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/site";
import { buildVCard } from "@/lib/vcard";

export const dynamic = "force-dynamic";

/**
 * "Save contact": a vCard (.vcf) with the person's details, photo and social links.
 * iPhone shows a "Create New Contact" sheet; Android opens it in Contacts.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const username = decodeURIComponent((await params).username).toLowerCase();
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, username: true, displayName: true, bio: true, avatarUrl: true, suspended: true,
      jobTitle: true, company: true, phone: true, whatsapp: true, publicEmail: true, location: true,
      links: { where: { isActive: true }, orderBy: { position: "asc" }, select: { title: true, url: true, platform: true } },
    },
  });
  if (!user || user.suspended) return new NextResponse("Contact not found", { status: 404 });

  const name = user.displayName?.trim() || user.username;
  const vcard = buildVCard({
    ...user,
    name,
    profileUrl: `${APP_URL}/${user.username}`,
    links: user.links.map((l) => ({ label: l.title, url: l.url, platform: l.platform })),
  });

  // Counting must never block the download.
  await prisma.user.update({ where: { id: user.id }, data: { contactSaves: { increment: 1 } } }).catch(() => undefined);

  const filename = `${name.replace(/[^\p{L}\p{N} _-]/gu, "").trim().replace(/\s+/g, "-") || user.username}.vcf`;
  // Headers must be plain ASCII; browsers that understand filename* get the accented name.
  const asciiName = filename.normalize("NFKD").replace(/[^ -~]/g, "") || `${user.username}.vcf`;
  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
