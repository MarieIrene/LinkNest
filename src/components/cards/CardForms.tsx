"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/client-api";
import { PRODUCTS, type ProductId } from "@/lib/products";

/** Admin: create a batch of cards, optionally given straight to one person. */
export function CreateCardsForm({
  defaults = {}, lockedAssignTo,
}: { defaults?: { type?: string; quantity?: string; assignTo?: string }; lockedAssignTo?: string }) {
  const router = useRouter();
  const [type, setType] = useState<ProductId>(defaults.type && defaults.type in PRODUCTS ? (defaults.type as ProductId) : "business-card");
  const [quantity, setQuantity] = useState(defaults.quantity ?? "1");
  const [label, setLabel] = useState("");
  const [assignTo, setAssignTo] = useState(lockedAssignTo ?? defaults.assignTo ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setMessage(null);
    const res = await apiRequest<{ cards: { id: string; code: string }[] }>("/api/admin/cards", {
      method: "POST",
      body: { type, quantity, label, assignTo: assignTo.trim() || undefined },
    });
    setPending(false);
    if (!res.ok) {
      setErrors(res.fields);
      if (!Object.keys(res.fields).length) setMessage({ text: res.error, error: true });
      return;
    }
    const n = res.data.cards.length;
    if (n === 1) {
      router.push(`/admin/cards/${res.data.cards[0].id}`);
      return;
    }
    setMessage({ text: `${n} cards created: ${res.data.cards.map((c) => c.code).join(", ")}` });
    setLabel("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="card-type" className="label">Product</label>
          <select id="card-type" value={type} onChange={(e) => setType(e.target.value as ProductId)} className="field">
            {(Object.keys(PRODUCTS) as ProductId[]).map((id) => <option key={id} value={id}>{PRODUCTS[id].name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="card-qty" className="label">How many</label>
          <input id="card-qty" type="number" min={1} max={200} value={quantity} onChange={(e) => setQuantity(e.target.value)}
            className={`field ${errors.quantity ? "field-error" : ""}`} />
          {errors.quantity && <p className="error-text">{errors.quantity}</p>}
        </div>
        {!lockedAssignTo && (
          <div>
            <label htmlFor="card-assign" className="label">Give to <span className="font-normal text-ink/50">(optional)</span></label>
            <input id="card-assign" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="username or email"
              spellCheck={false} autoCapitalize="none" className={`field ${errors.assignTo ? "field-error" : ""}`} />
            {errors.assignTo && <p className="error-text">{errors.assignTo}</p>}
          </div>
        )}
        <div>
          <label htmlFor="card-label" className="label">Note <span className="font-normal text-ink/50">(optional)</span></label>
          <input id="card-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Batch 3, matte black"
            className={`field ${errors.label ? "field-error" : ""}`} />
          {errors.label && <p className="error-text">{errors.label}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Creating…" : Number(quantity) > 1 ? `Create ${quantity} cards` : "Create card"}
        </button>
        {message && <p role="status" className={`text-sm ${message.error ? "text-red-700" : "text-primary"}`}>{message.text}</p>}
      </div>
    </form>
  );
}

type CardControlsProps = {
  cardId: string;
  status: string;
  owner: { username: string } | null;
  label: string | null;
};

/** Admin: give the card to someone, take it back, switch it off/on and edit its note. */
export function CardControls({ cardId, status, owner, label: initialLabel }: CardControlsProps) {
  const router = useRouter();
  const [assignTo, setAssignTo] = useState("");
  const [label, setLabel] = useState(initialLabel ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  async function patch(body: Record<string, string>, what: string, done: string) {
    setBusy(what);
    setMessage(null);
    const res = await apiRequest(`/api/admin/cards/${cardId}`, { method: "PATCH", body });
    setBusy(null);
    if (!res.ok) return setMessage({ text: res.fields.assignTo ?? res.fields.label ?? res.error, error: true });
    setMessage({ text: done });
    setAssignTo("");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => { e.preventDefault(); if (assignTo.trim()) patch({ assignTo }, "assign", "Card given. Tapping it now opens their profile."); }}
        className="space-y-2"
      >
        <label htmlFor="assign-to" className="label">{owner ? "Give this card to someone else" : "Give this card to"}</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="assign-to" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="username or login email"
            spellCheck={false} autoCapitalize="none" className="field" />
          <button type="submit" disabled={busy !== null || !assignTo.trim()} className="btn-primary shrink-0">
            {busy === "assign" ? "Saving…" : "Give card"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {owner && (
          <button type="button" disabled={busy !== null} className="btn-ghost border border-line"
            onClick={() => window.confirm(`Take this card back from @${owner.username}? Tapping it will show "not set up yet".`) &&
              patch({ assignTo: "" }, "unassign", "Card taken back. It's not linked to anyone now.")}>
            Take back from @{owner.username}
          </button>
        )}
        {status === "active" ? (
          <button type="button" disabled={busy !== null} className="btn-ghost border border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => window.confirm("Switch this card off? Anyone tapping it will see “This card is no longer active”.") &&
              patch({ status: "disabled" }, "status", "Card switched off.")}>
            Switch card off (lost / replaced)
          </button>
        ) : (
          <button type="button" disabled={busy !== null} className="btn-ghost border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
            onClick={() => patch({ status: "active" }, "status", "Card switched back on.")}>
            Switch card back on
          </button>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); patch({ label }, "label", "Note saved."); }} className="space-y-2">
        <label htmlFor="card-note" className="label">Note</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="card-note" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Batch 3, matte black" className="field" />
          <button type="submit" disabled={busy !== null || label === (initialLabel ?? "")} className="btn-ghost shrink-0 border border-line">Save note</button>
        </div>
      </form>

      {message && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${message.error ? "bg-red-50 text-red-800" : "bg-secondary-soft text-primary-dark"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
