import type { Metadata } from "next";
import { ProfileView } from "@/components/dashboard/SectionViews";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return <ProfileView />;
}
