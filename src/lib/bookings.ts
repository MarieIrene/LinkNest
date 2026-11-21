/** The steps a card order goes through. Order matters: it's the order shown in the admin panel. */
export const BOOKING_STATUSES = [
  { id: "new", label: "New", hint: "Nobody has called yet", tone: "bg-amber-100 text-amber-900" },
  { id: "confirmed", label: "Confirmed", hint: "Called; the customer wants it", tone: "bg-sky-100 text-sky-900" },
  { id: "paid", label: "Paid", hint: "Payment received", tone: "bg-violet-100 text-violet-900" },
  { id: "ready", label: "Card ready", hint: "Profile set up, card programmed", tone: "bg-teal-100 text-teal-900" },
  { id: "delivered", label: "Delivered", hint: "The customer has the card", tone: "bg-emerald-100 text-emerald-900" },
  { id: "declined", label: "Declined", hint: "Cancelled, unreachable or spam", tone: "bg-slate-200 text-slate-700" },
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number]["id"];
export const BOOKING_STATUS_IDS = BOOKING_STATUSES.map((s) => s.id) as [BookingStatus, ...BookingStatus[]];

/** Statuses where the money has come in, for the revenue figure. */
export const PAID_STATUSES: BookingStatus[] = ["paid", "ready", "delivered"];

export function bookingStatus(id: string) {
  return BOOKING_STATUSES.find((s) => s.id === id) ?? BOOKING_STATUSES[0];
}
