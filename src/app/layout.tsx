import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { APP_NAME, APP_URL } from "@/lib/site";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: `${APP_NAME}: smart NFC business cards`, template: `%s | ${APP_NAME}` },
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  description:
    "Store your business profile on one smart NFC card. Tap it on a phone to share your contacts, social media and website instantly. Business Smart Card 10,000 RWF, Social Media Tag 5,000 RWF.",
};

export const viewport: Viewport = {
  themeColor: "#164E63",
  width: "device-width",
  initialScale: 1,
  // Lets the app draw under the notch; the bottom tab bar pads itself with the safe area.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
