import type { Metadata } from "next";
import { OverviewView } from "@/components/dashboard/OverviewView";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <OverviewView />;
}
