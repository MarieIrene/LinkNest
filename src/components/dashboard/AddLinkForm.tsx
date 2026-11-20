"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import { PLATFORM_IDS, PLATFORMS, PlatformIcon, type PlatformId } from "@/lib/platforms";
import type { DashboardLink } from "@/lib/types";

export function AddLinkForm({ onCreated }: { onCreated: (link: DashboardLink) => void }) {
  const [platform, setPlatform] = useState<PlatformId>("instagram");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const selected = PLATFORMS[platform];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);
    const res = await apiRequest<{ link: DashboardLink }>("/api/links", {
      method: "POST",
      body: { platform, title: title.trim() || selected.name, url },
    });
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
    <form onSubmit={onSubmit} noValidate className="panel space-y-5">
      <fieldset>
        <legend className="label">Choose what to add</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {PLATFORM_IDS.map((id) => {
            const p = PLATFORMS[id];
            const active = id === platform;
            return (
              <label
                key={id}
                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                  active ? "border-primary bg-primary-soft text-primary ring-2 ring-secondary" : "border-line text-ink/75 hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="platform"
                  value={id}
                  checked={active}
                  onChange={() => {
                    setPlatform(id);
                    setErrors({});
                  }}
                  className="sr-only"
                />
                <PlatformIcon id={id} size={34} />
                <span className="leading-tight">{p.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
        <div>
          <label htmlFor="new-title" className="label">Button text</label>
          <input id="new-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={selected.name}
            className={`field ${errors.title ? "field-error" : ""}`} aria-invalid={Boolean(errors.title)} />
          {errors.title ? <p className="error-text">{errors.title}</p> : <p className="mt-1.5 text-sm text-ink/55">Leave empty to use “{selected.name}”.</p>}
        </div>
        <div>
          <label htmlFor="new-url" className="label">{selected.inputLabel}</label>
          <input id="new-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={selected.placeholder}
            inputMode={platform === "phone" || platform === "whatsapp" ? "tel" : platform === "email" ? "email" : "url"}
            spellCheck={false} className={`field ${errors.url ? "field-error" : ""}`} aria-invalid={Boolean(errors.url)} />
          {errors.url && <p className="error-text">{errors.url}</p>}
        </div>
      </div>
      {formError && <p role="alert" className="error-text">{formError}</p>}
      <button type="submit" disabled={pending} className="btn-primary gap-2">
        <PlatformIcon id={platform} size={22} />
        {pending ? "Adding…" : `Add ${selected.name}`}
      </button>
    </form>
  );
}
