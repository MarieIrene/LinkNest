import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Every public link points here first so clicks can be counted, then we redirect.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await prisma.link.findFirst({ where: { id, isActive: true }, select: { url: true } });
  if (!link) return NextResponse.redirect(new URL("/", req.url));

  await prisma.link.update({ where: { id }, data: { clicks: { increment: 1 } } });
  return NextResponse.redirect(link.url, 302);
}
