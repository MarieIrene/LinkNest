export const APP_NAME = "LinkNest";
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const APP_HOST = new URL(APP_URL).host;

/** The address to write onto a person's NFC card. It stays valid even if they change their username. */
export const cardUrl = (userId: string) => `${APP_URL}/c/${userId}`;

export const COMPANY = {
  name: "Arvash Tech",
  website: "https://arvash.com",
  phones: ["0784424423", "0786729283"],
};

/** Comma-separated list of emails that can see booking requests at /dashboard/bookings. */
export function isAdminEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.toLowerCase());
}
