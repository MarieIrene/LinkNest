"use client";

import { useRef, useState, type FormEvent } from "react";
import { Avatar } from "@/components/Avatar";
import { apiRequest } from "@/lib/client-api";
import type { DashboardProfile } from "@/lib/types";

type Props = { profile: DashboardProfile; appUrl: string; onSaved: (p: DashboardProfile) => void };

export function ProfileForm({ profile, appUrl, onSaved }: Props) {
  const [values, setValues] = useState({
    displayName: profile.displayName ?? "",
    username: profile.username,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    jobTitle: profile.jobTitle ?? "",
    company: profile.company ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
    publicEmail: profile.publicEmail ?? "",
    location: profile.location ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const isUploaded = values.avatarUrl.startsWith("data:");
  const [linkOpen] = useState(Boolean(profile.avatarUrl) && !profile.avatarUrl?.startsWith("data:"));

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErrors((prev) => ({ ...prev, avatarUrl: "" }));
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatarUrl: "Choose an image file (JPG, PNG or WebP)." }));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatarUrl: "That file is over 15 MB. Choose a smaller photo." }));
      return;
    }
    try {
      const dataUrl = await squarePhoto(file, 400);
      setValues((v) => ({ ...v, avatarUrl: dataUrl }));
      setPhotoNote("New photo ready. Save your profile to publish it.");
      setStatus("idle");
    } catch {
      setErrors((prev) => ({ ...prev, avatarUrl: "We couldn't read that photo. Try a JPG or PNG." }));
    }
  }

  function removePhoto() {
    setValues((v) => ({ ...v, avatarUrl: "" }));
    setPhotoNote("Photo removed. Save your profile to apply it.");
    setStatus("idle");
  }

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
    setPhotoNote(null);
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
        <p className="label">Profile photo</p>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={values.displayName || values.username} src={values.avatarUrl || null} size={80} />
          <div className="flex flex-wrap gap-2">
            <input ref={fileInput} id="avatarFile" type="file" accept="image/jpeg,image/png,image/webp,image/*"
              onChange={onPickPhoto} className="sr-only" aria-describedby="avatar-hint" />
            <button type="button" onClick={() => fileInput.current?.click()} className="btn-primary">
              {values.avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {values.avatarUrl && (
              <button type="button" onClick={removePhoto} className="btn-ghost text-red-700 hover:bg-red-50">Remove</button>
            )}
          </div>
        </div>
        <p id="avatar-hint" aria-live="polite" className={errors.avatarUrl ? "error-text" : "mt-2 text-sm text-ink/55"}>
          {errors.avatarUrl || photoNote || "Choose a photo from your phone or computer. We crop it to a square. Leave empty to show your initials."}
        </p>

        <details className="mt-3 text-sm" open={linkOpen}>
          <summary className="cursor-pointer font-medium text-primary">Or use an image link</summary>
          <label htmlFor="avatarUrl" className="sr-only">Profile photo link</label>
          <input id="avatarUrl" value={isUploaded ? "" : values.avatarUrl} onChange={update("avatarUrl")} inputMode="url"
            spellCheck={false} placeholder={isUploaded ? "Using your uploaded photo" : "https://…/photo.jpg"}
            className="field mt-2" />
        </details>
      </div>

      <fieldset className="space-y-5 border-t border-line pt-5">
        <legend className="sr-only">Contact details</legend>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Contact details</h3>
          <p className="mt-0.5 text-sm text-ink/60">
            Shown at the top of your page and saved into people&apos;s phones with &ldquo;Save contact&rdquo;. Leave a box empty to keep it private.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {([
            { key: "jobTitle", label: "Job title / profession", placeholder: "e.g. CEO, Photographer", type: "text", auto: "organization-title" },
            { key: "company", label: "Company", placeholder: "e.g. Amani Group Ltd", type: "text", auto: "organization" },
            { key: "phone", label: "Phone (for calls)", placeholder: "0788 000 000", type: "tel", auto: "tel" },
            { key: "whatsapp", label: "WhatsApp number", placeholder: "0788 000 000", type: "tel", auto: "tel" },
            { key: "publicEmail", label: "Email to show", placeholder: "you@company.com", type: "email", auto: "email" },
            { key: "location", label: "Location", placeholder: "e.g. Kigali, Rwanda", type: "text", auto: "address-level2" },
          ] as const).map((f) => (
            <div key={f.key}>
              <label htmlFor={`contact-${f.key}`} className="label">{f.label}</label>
              <input id={`contact-${f.key}`} type={f.type} autoComplete={f.auto} value={values[f.key]} onChange={update(f.key)}
                placeholder={f.placeholder} spellCheck={f.type === "text"}
                className={`field ${errors[f.key] ? "field-error" : ""}`} aria-invalid={Boolean(errors[f.key])} />
              {errors[f.key] && <p className="error-text">{errors[f.key]}</p>}
            </div>
          ))}
        </div>
        <p className="text-sm text-ink/55">
          Tip: your login email stays private. Only the &ldquo;Email to show&rdquo; appears on your page.
        </p>
      </fieldset>

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

/** Center-crops an image to a square and shrinks it, so uploads stay small (~30 KB). */
async function squarePhoto(file: File, size: number): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(size, side);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side,
      0, 0, canvas.width, canvas.height,
    );
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
