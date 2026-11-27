import QRCode from "qrcode";
import { APP_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * QR code for a card link, to print on the back of the card as a backup for phones
 * without NFC. SVG by default (sharp at any print size); ?format=png for a 1024px image;
 * ?download=1 to save it as a file.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9]{6,40}$/.test(id)) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const target = `${APP_URL}/c/${id}`;
  const download = url.searchParams.get("download") === "1";
  const options = { errorCorrectionLevel: "M" as const, margin: 2, color: { dark: "#0B2F3B", light: "#FFFFFF" } };

  if (url.searchParams.get("format") === "png") {
    const png = await QRCode.toBuffer(target, { ...options, width: 1024 });
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        ...(download ? { "Content-Disposition": `attachment; filename="linknest-card-${id}.png"` } : {}),
      },
    });
  }

  const svg = await QRCode.toString(target, { ...options, type: "svg" });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
      ...(download ? { "Content-Disposition": `attachment; filename="linknest-card-${id}.svg"` } : {}),
    },
  });
}
