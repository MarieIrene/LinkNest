import type { Metadata } from "next";
import { CardsView } from "@/components/dashboard/CardPanel";

export const metadata: Metadata = { title: "Your card" };

export default function CardPage() {
  return <CardsView />;
}
