import { z } from "zod";

// Paths used by the app itself; nobody can claim these as a username.
export const RESERVED_USERNAMES = new Set([
  "login", "register", "logout", "dashboard", "api", "go", "admin", "settings",
  "about", "help", "terms", "privacy", "icon.svg", "favicon.ico", "_next",
]);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters.")
  .max(30, "Use 30 characters or fewer.")
  .regex(/^[a-z0-9_.]+$/, "Use letters, numbers, dots or underscores only.")
  .refine((v) => !RESERVED_USERNAMES.has(v), "That username is reserved. Try another.");

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/** Adds https:// when missing and rejects unsafe schemes like javascript:. */
export function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) || /^(mailto|tel):/i.test(value);
  try {
    const url = new URL(hasScheme ? value : `https://${value}`);
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return null;
    if ((url.protocol === "http:" || url.protocol === "https:") && !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const linkUrlSchema = z
  .string()
  .max(2048, "That address is too long.")
  .transform((value, ctx) => {
    const url = normalizeUrl(value);
    if (!url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a full web address, like example.com/page." });
      return z.NEVER;
    }
    return url;
  });

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Use 72 characters or fewer."),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const createLinkSchema = z.object({
  title: z.string().trim().min(1, "Give the link a title.").max(80, "Keep the title under 80 characters."),
  url: linkUrlSchema,
});

export const updateLinkSchema = createLinkSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).max(500),
});

export const profileSchema = z.object({
  username: usernameSchema.optional(),
  displayName: z.string().trim().max(60, "Keep your name under 60 characters.").optional(),
  bio: z.string().trim().max(160, "Keep your bio under 160 characters.").optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Use an image link that starts with https://.")
    .optional(),
});
