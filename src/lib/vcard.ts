import "server-only";
import { toInternational, type ContactInfo } from "./contact";

// ---------- vCard (.vcf) ----------

/** Escape text for a vCard value (RFC 6350 §3.4). */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** vCard lines must be folded at 75 octets; continuation lines start with a space. */
function fold(line: string) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Don't cut a multi-byte character in half.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(bytes.subarray(start, end).toString("utf8"));
    start = end;
    limit = 74; // following lines lose one octet to the leading space
  }
  return parts.join("\r\n ");
}

type VCardInput = ContactInfo & {
  name: string;
  bio?: string | null;
  profileUrl: string;
  /** Uploaded photo (data URL) or an https image link. */
  avatarUrl?: string | null;
  /** Social and website links to include, e.g. [{ label: "Instagram", url: "…" }]. */
  links: { label: string; url: string; platform: string }[];
};

const SOCIAL_TYPES: Record<string, string> = {
  instagram: "instagram", linkedin: "linkedin", facebook: "facebook", x: "twitter",
  tiktok: "tiktok", youtube: "youtube", github: "github",
};

/** Builds a vCard 3.0 that iPhone, Android and Outlook all import. */
export function buildVCard(v: VCardInput) {
  const parts = v.name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const first = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] ?? "";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(v.name)}`,
  ];
  if (v.company) lines.push(`ORG:${esc(v.company)}`);
  if (v.jobTitle) lines.push(`TITLE:${esc(v.jobTitle)}`);
  if (v.phone) lines.push(`TEL;TYPE=CELL,VOICE:${toInternational(v.phone)}`);
  if (v.whatsapp && v.whatsapp !== v.phone) lines.push(`TEL;TYPE=CELL:${toInternational(v.whatsapp)}`);
  if (v.publicEmail) lines.push(`EMAIL;TYPE=INTERNET,PREF:${esc(v.publicEmail)}`);
  if (v.location) lines.push(`ADR;TYPE=WORK:;;${esc(v.location)};;;;`);
  lines.push(`URL:${v.profileUrl}`);

  for (const link of v.links) {
    // Contacts apps only understand web addresses here (tel:/mailto: links are covered above).
    if (!/^https?:\/\//i.test(link.url)) continue;
    if (link.platform === "website") lines.push(`URL;TYPE=WORK:${link.url}`);
    else if (link.platform === "whatsapp" && !v.whatsapp) lines.push(`URL;TYPE=WhatsApp:${link.url}`);
    else if (SOCIAL_TYPES[link.platform]) lines.push(`X-SOCIALPROFILE;TYPE=${SOCIAL_TYPES[link.platform]}:${link.url}`);
  }

  const photo = v.avatarUrl?.match(/^data:image\/(jpeg|png);base64,(.+)$/);
  if (photo) lines.push(`PHOTO;ENCODING=b;TYPE=${photo[1] === "png" ? "PNG" : "JPEG"}:${photo[2]}`);
  else if (v.avatarUrl?.startsWith("https://")) lines.push(`PHOTO;VALUE=URI:${v.avatarUrl}`);

  const noteParts = [v.bio?.trim(), `Saved from ${v.profileUrl}`].filter(Boolean) as string[];
  lines.push(`NOTE:${esc(noteParts.join("\n\n"))}`);
  lines.push("END:VCARD");
  return lines.map(fold).join("\r\n") + "\r\n";
}
