import type { Metadata } from "next";
import { LinksView } from "@/components/dashboard/SectionViews";

export const metadata: Metadata = { title: "Links" };

export default function LinksPage() {
  return <LinksView />;
}
