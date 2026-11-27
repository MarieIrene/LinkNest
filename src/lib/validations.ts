import { z } from "zod";
import { PRODUCT_IDS } from "./products";
import { PLATFORM_IDS, getPlatform, toPlatformUrl } from "./platforms";

// Paths used by the app itself; nobody can claim these as a username.
export const RESERVED_USERNAMES = new Set([
  "login", "register", "logout", "dashboard", "api", "go", "admin", "settings",
  "about", "help", "terms", "privacy", "icon.svg", "favicon.ico", "_next", "c",
  "forgot-password", "reset-password", "offline", "offline.html", "icons", "card", "sw.js", "manifest.webmanifest",
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

/** Photos uploaded from the dashboard are resized in the browser and stored as data URLs. */
export const UPLOADED_AVATAR = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;
const MAX_AVATAR_LENGTH = 400_000;

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

const newPasswordSchema = z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer.");

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: newPasswordSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, "This reset link is incomplete.").max(200),
  password: newPasswordSchema,
});

const linkTitleSchema = z.string().trim().max(80, "Keep the title under 80 characters.");
const platformSchema = z.enum(PLATFORM_IDS);
const rawUrlSchema = z.string().max(2048, "That address is too long.");

const badUrl = (ctx: z.RefinementCtx) =>
  ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "Enter a full web address, like example.com/page." });

/** New link: the title falls back to the platform name, and handles/numbers become full URLs. */
export const createLinkSchema = z
  .object({
    platform: platformSchema.default("website"),
    title: linkTitleSchema.optional(),
    url: rawUrlSchema,
  })
  .transform((data, ctx) => {
    const url = normalizeUrl(toPlatformUrl(data.platform, data.url));
    if (!url) {
      badUrl(ctx);
      return z.NEVER;
    }
    return { platform: data.platform, title: data.title || getPlatform(data.platform).name, url };
  });

export const updateLinkSchema = z
  .object({
    platform: platformSchema.optional(),
    title: linkTitleSchema.min(1, "Give the link a title.").optional(),
    url: rawUrlSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .transform((data, ctx) => {
    if (data.url === undefined) return { ...data, url: undefined };
    const url = normalizeUrl(toPlatformUrl(data.platform, data.url));
    if (!url) {
      badUrl(ctx);
      return z.NEVER;
    }
    return { ...data, url };
  });

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).max(500),
});

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `Keep the ${label} under ${max} characters.`).optional();

const optionalPhone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || /^\+?[\d\s()-]{9,}$/.test(v), "Enter a full phone number, like 0788 000 000 or +250 788 000 000.")
  .optional();

export const profileSchema = z.object({
  username: usernameSchema.optional(),
  jobTitle: optionalText(80, "job title"),
  company: optionalText(80, "company name"),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  publicEmail: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address.")]).optional(),
  location: optionalText(100, "location"),
  displayName: z.string().trim().max(60, "Keep your name under 60 characters.").optional(),
  bio: z.string().trim().max(160, "Keep your bio under 160 characters.").optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(MAX_AVATAR_LENGTH, "That photo is too large. Try a smaller one.")
    .refine(
      (v) => v === "" || /^https:\/\/\S+$/.test(v) || UPLOADED_AVATAR.test(v),
      "Upload a photo or use an image link that starts with https://.",
    )
    .optional(),
});

export const bookingSchema = z.object({
  product: z.enum(PRODUCT_IDS, { message: "Choose a product." }),
  quantity: z.coerce.number().int().min(1, "Order at least 1.").max(500, "For more than 500, call us."),
  name: z.string().trim().min(2, "Enter your name.").max(80, "Keep your name under 80 characters."),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^\+?[\d\s()-]{9,}$/, "Enter a phone number we can call, like 0788 000 000."),
  email: z.union([z.literal(""), emailSchema]).optional(),
  message: z.string().trim().max(500, "Keep the note under 500 characters.").optional(),
  /** Honeypot: real visitors never see or fill this field. */
  company: z.string().max(0).optional(),
});
