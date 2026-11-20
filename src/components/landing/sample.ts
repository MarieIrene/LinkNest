import type { PublicLink } from "@/lib/types";

/** The example profile used across the landing page. */
export const sampleProfile = {
  username: "amani",
  displayName: "Amani CEO",
  bio: "Founder & CEO in Kigali. Let's connect and grow together.",
  links: [
    { id: "1", title: "Call me", url: "#", platform: "phone" },
    { id: "2", title: "Chat on WhatsApp", url: "#", platform: "whatsapp" },
    { id: "3", title: "LinkedIn", url: "#", platform: "linkedin" },
    { id: "4", title: "Instagram", url: "#", platform: "instagram" },
    { id: "5", title: "Company website", url: "#", platform: "website" },
    { id: "6", title: "Email me", url: "#", platform: "email" },
  ] satisfies PublicLink[],
};

export const formatRwf = (n: number) => `${n.toLocaleString("en-US")} RWF`;
