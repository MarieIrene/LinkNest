import { APP_URL } from "./site";

/** No 0/O, 1/I/L: codes are read aloud and typed by people, so avoid look-alikes. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CARD_CODE_LENGTH = 6;
export const CARD_CODE_PATTERN = new RegExp(`^[${ALPHABET}]{${CARD_CODE_LENGTH}}$`);

/** Random code from a cryptographic source (Web Crypto works in Node and browsers). */
export function generateCardCode() {
  const bytes = new Uint32Array(CARD_CODE_LENGTH);
  globalThis.crypto.getRandomValues(bytes);
  // 2^32 isn't a multiple of 31, but the bias (under 1 in 100 million) doesn't matter for card codes.
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

/** Card codes are case-insensitive for people typing them. */
export const normalizeCardCode = (raw: string) => raw.trim().toUpperCase();

/** The address written onto a physical card. */
export const cardCodeUrl = (code: string) => `${APP_URL}/c/${code}`;

export const CARD_STATUSES = {
  active: { label: "Active", tone: "bg-emerald-100 text-emerald-900" },
  disabled: { label: "Switched off", tone: "bg-red-100 text-red-800" },
} as const;
export type CardStatus = keyof typeof CARD_STATUSES;
