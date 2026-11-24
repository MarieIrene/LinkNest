import type { MetadataRoute } from "next";

/** Makes LinkNest installable as an app (Add to Home Screen / Install app). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LinkNest: smart NFC business cards",
    short_name: "LinkNest",
    description: "Manage your NFC card profile, links and bookings.",
    id: "/",
    start_url: "/dashboard?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F9F9",
    theme_color: "#164E63",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My links", url: "/dashboard/links", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Admin: bookings", url: "/admin/bookings", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
