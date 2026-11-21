"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/client-api";
import { BOOKING_STATUSES, bookingStatus } from "@/lib/bookings";
import { formatDateTime as when } from "@/lib/dates";

export type AdminBooking = {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Rwandan numbers written locally (07…) become international (2507…) for WhatsApp. */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.startsWith("0") ? `250${digits.slice(1)}` : digits;
}

export function BookingCard({ booking: initial }: { booking: AdminBooking }) {
  const [booking, setBooking] = useState(initial);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [saving, setSaving] = useState<"status" | "notes" | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const status = bookingStatus(booking.status);
  const notesChanged = notes.trim() !== (booking.notes ?? "");

  async function save(patch: { status?: string; notes?: string }, what: "status" | "notes") {
    setSaving(what);
    setMessage(null);
    const res = await apiRequest<{ booking: { status: string; notes: string | null; updatedAt: string } }>(
      `/api/admin/bookings/${booking.id}`,
      { method: "PATCH", body: patch },
    );
    setSaving(null);
    if (!res.ok) {
      setMessage({ text: res.fields.notes ?? res.error, error: true });
      return;
    }
    setBooking((b) => ({ ...b, ...res.data.booking }));
    setNotes(res.data.booking.notes ?? "");
    setMessage({ text: what === "status" ? `Marked as ${bookingStatus(res.data.booking.status).label}` : "Notes saved" });
  }

  return (
    <li className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-ink">{booking.name}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.tone}`}>{status.label}</span>
          </div>
          <p className="mt-1 text-ink/75">
            <strong>{booking.quantity} × {booking.productName}</strong> · {(booking.price * booking.quantity).toLocaleString("en-US")} RWF
          </p>
          <p className="mt-1 text-sm text-ink/55">Booked {when(booking.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${booking.phone.replace(/[^\d+]/g, "")}`} className="btn-primary px-4 py-2 text-sm">Call {booking.phone}</a>
          <a href={`https://wa.me/${whatsappNumber(booking.phone)}`} target="_blank" rel="noopener noreferrer"
            className="btn-ghost border border-line px-4 py-2 text-sm">WhatsApp</a>
          {booking.email && (
            <a href={`mailto:${booking.email}`} className="btn-ghost border border-line px-4 py-2 text-sm">Email</a>
          )}
        </div>
      </div>

      {booking.message && (
        <p className="rounded-xl bg-paper px-4 py-3 text-sm text-ink/80">
          <span className="font-semibold">Customer note:</span> {booking.message}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <label htmlFor={`status-${booking.id}`} className="label">Status</label>
          <select
            id={`status-${booking.id}`}
            value={booking.status}
            disabled={saving === "status"}
            onChange={(e) => save({ status: e.target.value }, "status")}
            className="field"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}: {s.hint}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`notes-${booking.id}`} className="label">
            Staff notes <span className="font-normal text-ink/50">(customers never see these)</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea id={`notes-${booking.id}`} rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via MoMo, ref 12345. Deliver Friday." className="field resize-y" />
            <button type="button" disabled={!notesChanged || saving === "notes"} onClick={() => save({ notes }, "notes")}
              className="btn-primary shrink-0 self-start px-4 py-2 text-sm">
              {saving === "notes" ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      </div>

      <p aria-live="polite" className={`text-sm ${message?.error ? "text-red-700" : "text-primary"}`}>
        {message?.text ?? (booking.updatedAt !== booking.createdAt ? `Last updated ${when(booking.updatedAt)}` : "")}
      </p>
    </li>
  );
}
