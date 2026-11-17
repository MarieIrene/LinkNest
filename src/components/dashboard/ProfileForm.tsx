"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import type { DashboardProfile } from "@/lib/types";

type Props = { profile: DashboardProfile; appUrl: string; onSaved: (p: DashboardProfile) => void };

export function ProfileForm({ profile, appUrl, onSaved }: Props) {
  const [values, setValues] = useState({
    displayName: profile.displayName ?? "",
    username: profile.username,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const update = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setStatus("idle");
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrors({});
    setFormError(null);
    const res = await apiRequest<{ profile: DashboardProfile }>("/api/profile", { method: "PATCH", body: values });
    if (!res.ok) {
      setErrors(res.fields);
      if (!Object.keys(res.fields).length) setFormError(res.error);
      setStatus("idle");
      return;
    }
    onSaved(res.data.profile);
    setValues((v) => ({ ...v, username: res.data.profile.username }));
    setStatus("saved");
  }

  const host = appUrl.replace(/^https?:\/\//, "");

  return (
    <form onSubmit={onSubmit} noValidate className="panel space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="displayName" className="label">Name</label>
          <input id="displayName" value={values.displayName} onChange={update("displayName")} placeholder="Your name"
            className={`field ${errors.displayName ? "field-error" : ""}`} />
          {errors.displayName && <p className="error-text">{errors.displayName}</p>}
        </div>
        <div>
          <label htmlFor="profile-username" className="label">Username</label>
          <input id="profile-username" value={values.username} onChange={update("username")} spellCheck={false}
            className={`field ${errors.username ? "field-error" : ""}`} aria-describedby="profile-username-hint" />
          <p id="profile-username-hint" className={errors.username ? "error-text" : "mt-1.5 truncate text-sm text-ink/55"}>
            {errors.username ?? `${host}/${values.username || "yourname"}`}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="label">Bio</label>
        <textarea id="bio" rows={3} value={values.bio} onChange={update("bio")} maxLength={160}
          placeholder="One or two lines about you" className={`field resize-none ${errors.bio ? "field-error" : ""}`}
          aria-describedby="bio-count" />
        <p id="bio-count" className={errors.bio ? "error-text" : "mt-1.5 text-right text-sm text-ink/55"}>
          {errors.bio ?? `${values.bio.length}/160`}
        </p>
      </div>

      <div>
        <label htmlFor="avatarUrl" className="label">Profile photo link</label>
        <input id="avatarUrl" value={values.avatarUrl} onChange={update("avatarUrl")} inputMode="url" spellCheck={false}
          placeholder="https://…/photo.jpg" className={`field ${errors.avatarUrl ? "field-error" : ""}`} />
        <p className={errors.avatarUrl ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
          {errors.avatarUrl ?? "Leave empty to show your initials."}
        </p>
      </div>

      {formError && <p role="alert" className="error-text">{formError}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving" ? "Saving…" : "Save profile"}
        </button>
        <span aria-live="polite" className="text-sm text-primary">{status === "saved" ? "Profile saved" : ""}</span>
      </div>
    </form>
  );
}
