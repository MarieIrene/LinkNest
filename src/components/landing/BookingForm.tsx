"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { BOOK_EVENT } from "./BookButton";
import { formatRwf } from "./sample";

const empty = { name: "", phone: "", email: "", quantity: "1", message: "", company: "" };

export function BookingForm() {
  const [product, setProduct] = useState<ProductId>("business-card");
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  // "Book now" buttons elsewhere on the page preselect a product.
  useEffect(() => {
    const onBook = (e: Event) => {
      const id = (e as CustomEvent<ProductId>).detail;
      if (id in PRODUCTS) {
        setProduct(id);
        setStatus((s) => (s === "done" ? "idle" : s));
      }
    };
    window.addEventListener(BOOK_EVENT, onBook);
    return () => window.removeEventListener(BOOK_EVENT, onBook);
  }, []);

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const qty = Math.max(1, Math.floor(Number(values.quantity)) || 1);
  const total = PRODUCTS[product].price * qty;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    setFormError(null);
    const res = await apiRequest("/api/bookings", { method: "POST", body: { ...values, product } });
    if (!res.ok) {
      setErrors(res.fields);
      if (!Object.keys(res.fields).length) setFormError(res.error);
      setStatus("idle");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="panel flex flex-col items-center py-12 text-center" role="status">
        <span className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary-dark">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-primary">Booking received</h3>
        <p className="mt-2 max-w-[40ch] leading-relaxed text-ink/70">
          Thank you, {values.name.split(" ")[0]}. We&apos;ll call you on <strong className="text-ink">{values.phone}</strong> to
          set up your profile and prepare your {PRODUCTS[product].name.toLowerCase()}.
        </p>
        <button
          type="button"
          className="btn-ghost mt-6"
          onClick={() => {
            setValues(empty);
            setStatus("idle");
          }}
        >
          Book another card
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel space-y-5 shadow-[0_30px_60px_-35px_rgba(11,47,59,0.45)]">
      <fieldset>
        <legend className="label">1. Select product</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(PRODUCTS) as ProductId[]).map((id) => {
            const active = id === product;
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                  active ? "border-primary bg-primary-soft ring-2 ring-secondary" : "border-line hover:border-primary/40"
                }`}
              >
                <input type="radio" name="product" value={id} checked={active} onChange={() => setProduct(id)} className="sr-only" />
                <span>
                  <span className="block font-semibold text-ink">{PRODUCTS[id].name}</span>
                  <span className="text-sm text-primary">{formatRwf(PRODUCTS[id].price)}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-primary" : "border-line"}`}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="label">2. Your name and contact details</legend>
        <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
          <div>
            <label htmlFor="b-name" className="sr-only">Full name</label>
            <input id="b-name" value={values.name} onChange={set("name")} placeholder="Full name" autoComplete="name"
              className={`field ${errors.name ? "field-error" : ""}`} aria-invalid={Boolean(errors.name)} />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="b-qty" className="sr-only">Quantity</label>
            <input id="b-qty" type="number" min={1} max={500} value={values.quantity} onChange={set("quantity")}
              className={`field ${errors.quantity ? "field-error" : ""}`} aria-invalid={Boolean(errors.quantity)}
              aria-describedby="b-qty-hint" />
            <p id="b-qty-hint" className={errors.quantity ? "error-text" : "mt-1.5 text-xs text-ink/55"}>
              {errors.quantity ?? "Quantity"}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="b-phone" className="sr-only">Phone number</label>
            <input id="b-phone" type="tel" value={values.phone} onChange={set("phone")} placeholder="Phone, e.g. 0788 000 000"
              autoComplete="tel" className={`field ${errors.phone ? "field-error" : ""}`} aria-invalid={Boolean(errors.phone)} />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="b-email" className="sr-only">Email (optional)</label>
            <input id="b-email" type="email" value={values.email} onChange={set("email")} placeholder="Email (optional)"
              autoComplete="email" className={`field ${errors.email ? "field-error" : ""}`} aria-invalid={Boolean(errors.email)} />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="b-message" className="sr-only">Note (optional)</label>
          <textarea id="b-message" rows={2} value={values.message} onChange={set("message")} maxLength={500}
            placeholder="Anything we should know? Job title, company name… (optional)"
            className={`field resize-none ${errors.message ? "field-error" : ""}`} />
          {errors.message && <p className="error-text">{errors.message}</p>}
        </div>
        {/* Honeypot for bots; hidden from people and screen readers. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={set("company")}
          aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
      </fieldset>

      {formError && <p role="alert" className="error-text">{formError}</p>}

      <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink/70">
          Total <span className="font-display text-2xl font-bold text-primary">{formatRwf(total)}</span>
        </p>
        <button type="submit" disabled={status === "sending"} className="btn-press text-lg">
          {status === "sending" ? "Sending…" : "3. Submit booking request"}
        </button>
      </div>
    </form>
  );
}
