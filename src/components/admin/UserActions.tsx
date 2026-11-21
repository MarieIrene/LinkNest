"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/client-api";

type Props = {
  userId: string;
  username: string;
  email: string;
  suspended: boolean;
  /** Admins can't suspend or delete themselves or other admins. */
  protectedAccount: boolean;
};

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this:", text);
        }
      }}
      className="btn-primary shrink-0"
      aria-live="polite"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export function UserActions({ userId, username, email, suspended: initialSuspended, protectedAccount }: Props) {
  const router = useRouter();
  const [suspended, setSuspended] = useState(initialSuspended);
  const [busy, setBusy] = useState<"suspend" | "reset" | "delete" | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function toggleSuspend() {
    const next = !suspended;
    if (next && !window.confirm(`Suspend @${username}? Their public page and card will show "unavailable" until you restore them.`)) return;
    setBusy("suspend");
    setMessage(null);
    const res = await apiRequest<{ user: { suspended: boolean } }>(`/api/admin/users/${userId}`, { method: "PATCH", body: { suspended: next } });
    setBusy(null);
    if (!res.ok) return setMessage({ text: res.error, error: true });
    setSuspended(res.data.user.suspended);
    setMessage({ text: res.data.user.suspended ? "Account suspended. Their page is now hidden." : "Account restored. Their page is visible again." });
    router.refresh();
  }

  async function sendReset() {
    setBusy("reset");
    setMessage(null);
    const res = await apiRequest<{ email: string }>(`/api/admin/users/${userId}/reset-password`, { method: "POST" });
    setBusy(null);
    if (!res.ok) return setMessage({ text: res.error, error: true });
    setMessage({ text: `Reset link sent to ${res.data.email}. It works for 1 hour.` });
  }

  async function remove() {
    setBusy("delete");
    setMessage(null);
    const res = await apiRequest(`/api/admin/users/${userId}`, { method: "DELETE", body: { confirmUsername: confirmText } });
    setBusy(null);
    if (!res.ok) return setMessage({ text: res.fields.confirmUsername ?? res.error, error: true });
    router.replace("/admin/users");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={sendReset} disabled={busy !== null} className="btn-ghost border border-line">
          {busy === "reset" ? "Sending…" : "Send password reset email"}
        </button>
        {!protectedAccount && (
          <button
            type="button"
            onClick={toggleSuspend}
            disabled={busy !== null}
            className={`btn-ghost border ${suspended ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50" : "border-amber-300 text-amber-800 hover:bg-amber-50"}`}
          >
            {busy === "suspend" ? "Saving…" : suspended ? "Restore account" : "Suspend account"}
          </button>
        )}
        {!protectedAccount && !confirmDelete && (
          <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy !== null}
            className="btn-ghost border border-red-200 text-red-700 hover:bg-red-50">
            Delete account
          </button>
        )}
      </div>
      <p className="text-sm text-ink/55">
        The reset email goes to {email}. You never see or set their password.
        {protectedAccount && " This account is an admin or your own, so it can't be suspended or deleted here."}
      </p>

      {confirmDelete && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-900">Delete @{username} permanently?</p>
          <p className="mt-1 text-sm text-red-800">
            Their page, links and card link stop working for good. This can&apos;t be undone. To confirm, type the username below.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="confirm-username" className="sr-only">Type the username to confirm</label>
            <input id="confirm-username" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={username}
              autoComplete="off" spellCheck={false} className="field sm:max-w-xs" />
            <button type="button" onClick={remove} disabled={busy !== null || confirmText.trim().toLowerCase() !== username}
              className="btn-ghost bg-red-700 text-white hover:bg-red-800 disabled:opacity-50">
              {busy === "delete" ? "Deleting…" : "Delete forever"}
            </button>
            <button type="button" onClick={() => { setConfirmDelete(false); setConfirmText(""); }} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {message && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${message.error ? "bg-red-50 text-red-800" : "bg-secondary-soft text-primary-dark"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
