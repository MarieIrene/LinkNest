"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import { PLATFORM_IDS, PLATFORMS, PlatformIcon, getPlatform } from "@/lib/platforms";
import type { DashboardLink } from "@/lib/types";

type Props = {
  link: DashboardLink;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onChange: (link: DashboardLink) => void;
  onDelete: () => void;
};

export function LinkRow({ link, isFirst, isLast, onMove, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [platform, setPlatform] = useState(link.platform);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rowError, setRowError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const res = await apiRequest<{ link: DashboardLink }>(`/api/links/${link.id}`, { method: "PATCH", body: { platform, title, url } });
    setPending(false);
    if (!res.ok) {
      setErrors(res.fields);
      if (!Object.keys(res.fields).length) setRowError(res.error);
      return;
    }
    onChange(res.data.link);
    setEditing(false);
    setRowError(null);
  }

  async function toggleActive() {
    const optimistic = { ...link, isActive: !link.isActive };
    onChange(optimistic);
    const res = await apiRequest(`/api/links/${link.id}`, { method: "PATCH", body: { isActive: optimistic.isActive } });
    if (!res.ok) {
      onChange(link);
      setRowError(res.error);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${link.title}"? This can't be undone.`)) return;
    const res = await apiRequest(`/api/links/${link.id}`, { method: "DELETE" });
    if (res.ok) onDelete();
    else setRowError(res.error);
  }

  function cancel() {
    setTitle(link.title);
    setUrl(link.url);
    setPlatform(link.platform);
    setErrors({});
    setEditing(false);
  }

  return (
    <li className={`panel transition-opacity ${link.isActive ? "" : "opacity-70"}`}>
      {editing ? (
        <form onSubmit={save} noValidate className="space-y-4">
          <div>
            <label htmlFor={`platform-${link.id}`} className="label">Type</label>
            <div className="flex items-center gap-3">
              <PlatformIcon id={platform} size={40} />
              <select id={`platform-${link.id}`} value={platform} onChange={(e) => setPlatform(e.target.value)} className="field">
                {PLATFORM_IDS.map((id) => <option key={id} value={id}>{PLATFORMS[id].name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={`title-${link.id}`} className="label">Title</label>
            <input id={`title-${link.id}`} value={title} onChange={(e) => setTitle(e.target.value)}
              className={`field ${errors.title ? "field-error" : ""}`} aria-invalid={Boolean(errors.title)} />
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>
          <div>
            <label htmlFor={`url-${link.id}`} className="label">{getPlatform(platform).inputLabel}</label>
            <input id={`url-${link.id}`} value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" spellCheck={false}
              className={`field ${errors.url ? "field-error" : ""}`} aria-invalid={Boolean(errors.url)} />
            {errors.url && <p className="error-text">{errors.url}</p>}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn-primary">{pending ? "Saving…" : "Save link"}</button>
            <button type="button" onClick={cancel} className="btn-ghost">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex flex-col">
            <IconButton label={`Move ${link.title} up`} disabled={isFirst} onClick={() => onMove(-1)}>
              <path d="M6 15l6-6 6 6" />
            </IconButton>
            <IconButton label={`Move ${link.title} down`} disabled={isLast} onClick={() => onMove(1)}>
              <path d="M6 9l6 6 6-6" />
            </IconButton>
          </div>

          <PlatformIcon id={link.platform} size={40} className="mt-1" />

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{link.title}</p>
            <p className="truncate text-sm text-ink/60">{link.url}</p>
            <p className="mt-2 text-sm text-ink/55">
              {link.clicks.toLocaleString()} {link.clicks === 1 ? "click" : "clicks"}
              {!link.isActive && " (hidden from your page)"}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <button type="button" onClick={() => setEditing(true)} className="btn-ghost px-3 py-1.5 text-sm">Edit</button>
              <button type="button" onClick={remove} className="btn-ghost px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">Delete</button>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={link.isActive}
            aria-label={`Show ${link.title} on your page`}
            onClick={toggleActive}
            className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors ${link.isActive ? "bg-primary" : "bg-line"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full transition-[left] ${link.isActive ? "left-6 bg-secondary" : "left-1 bg-white"}`} />
          </button>
        </div>
      )}
      {rowError && <p role="alert" className="error-text">{rowError}</p>}
    </li>
  );
}

function IconButton({ label, disabled, onClick, children }: {
  label: string; disabled: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick}
      className="rounded-lg p-1 text-primary hover:bg-primary-soft disabled:text-ink/20 disabled:hover:bg-transparent">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
