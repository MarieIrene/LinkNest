import { redirect } from "next/navigation";

/** Bookings moved into the admin panel; keep old links and bookmarks working. */
export default function OldBookingsPage() {
  redirect("/admin/bookings");
}
