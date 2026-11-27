/**
 * The URI prefixes defined by the NFC Forum URI record type (NDEF RTD "U").
 * They're the same choices NFC writing apps show in their "URL/URI" dropdown.
 * Safe to import in the browser (no Node APIs).
 */
export const NFC_URI_PREFIXES = [
  "https://", "http://", "https://www.", "http://www.", "tel:", "mailto:",
  "ftp://", "ftps://", "sftp://", "ftp://ftp.", "smb://", "nfs://", "file://", "dav://",
  "telnet://", "imap:", "rtsp://", "news:", "nntp://", "pop:", "sip:", "sips:", "tftp:",
  "btspp://", "btl2cap://", "btgoep://", "tcpobex://", "irdaobex://", "urn:", "urn:nfc:",
  "urn:epc:", "urn:epc:id:", "urn:epc:tag:", "urn:epc:pat:", "urn:epc:raw:",
] as const;

/** Splits a full address into the dropdown prefix and the rest, e.g. "https://" + "linknest.rw/c/AB12CD". */
export function splitUri(full: string): { prefix: string; rest: string } {
  const match = [...NFC_URI_PREFIXES].sort((a, b) => b.length - a.length).find((p) => full.toLowerCase().startsWith(p));
  return match ? { prefix: match, rest: full.slice(match.length) } : { prefix: "https://", rest: full };
}
