/** Contact details people can show on their public page and share with "Save contact". */
export type ContactInfo = {
  jobTitle?: string | null;
  company?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  publicEmail?: string | null;
  location?: string | null;
};

/** Rwandan numbers written locally (07…) become international (+2507…); other numbers keep their country code. */
export function toInternational(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0") && digits.length === 10) return `+250${digits.slice(1)}`;
  if (digits.startsWith("250")) return `+${digits}`;
  return digits;
}

export const telHref = (phone: string) => `tel:${toInternational(phone)}`;
export const whatsappHref = (phone: string) => `https://wa.me/${toInternational(phone).replace(/^\+/, "")}`;

/** "CEO at Amani Group", "CEO" or "Amani Group". */
export function roleLine(c: ContactInfo) {
  const title = c.jobTitle?.trim();
  const company = c.company?.trim();
  if (title && company) return `${title} at ${company}`;
  return title || company || "";
}
