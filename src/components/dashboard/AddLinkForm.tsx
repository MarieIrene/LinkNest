"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import type { DashboardLink } from "@/lib/types";

export function AddLinkForm({ onCreated }: { onCreated: (link: DashboardLink) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    const res = await apiRequest<{ link: DashboardLink }>("/api/links", { method: "POST", body: { title, url } });
    setPending(false);
    if (!res.ok) {
      setErrors(res.fields);
      if (!Object.keys(res.fields).length) setFormError(res.error);
      return;
    }
    onCreated(res.data.link);
    setTitle("");
    setUrl("");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="panel">
      <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
        <div>
          <label htmlFor="new-title" className="label">Title</label>
          <input id="new-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My portfolio"
            className={`field ${errors.title ? "field-error" : ""}`} aria-invalid={Boolean(errors.title)} />
          {errors.title && <p className="error-text">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="new-url" className="label">URL</label>
          <input id="new-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com/work"
            inputMode="url" spellCheck={false} className={`field ${errors.url ? "field-error" : ""}`} aria-invalid={Boolean(errors.url)} />
          {errors.url && <p className="error-text">{errors.url}</p>}
        </div>
      </div>
      {formError && <p role="alert" className="error-text">{formError}</p>}
      <button type="submit" disabled={pending} className="btn-primary mt-4">
        {pending ? "Adding…" : "Add link"}
      </button>
    </form>
  );
}
