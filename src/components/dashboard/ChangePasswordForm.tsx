"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/client-api";
import { useHydrated } from "@/lib/use-hydrated";
import { PasswordInput } from "@/components/PasswordInput";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const ready = useHydrated();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setStatus("idle");

    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmNewPassword") ?? "");

    if (!confirmPassword) return setErrors({ confirmNewPassword: "Type your new password again." });
    if (newPassword !== confirmPassword) {
      return setErrors({ confirmNewPassword: "The two new passwords don't match. Type the same password in both boxes." });
    }

    setStatus("saving");
    const res = await apiRequest("/api/profile/password", { method: "POST", body: { currentPassword, newPassword } });
    if (!res.ok) {
      setErrors(res.fields);
      if (!Object.keys(res.fields).length) setFormError(res.error);
      setStatus("idle");
      return;
    }
    formRef.current?.reset();
    setStatus("saved");
  }

  const hint = (key: string, text: string) => (
    <p id={`${key}-hint`} className={errors[key] ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
      {errors[key] ?? text}
    </p>
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="panel space-y-5">
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="currentPassword" className="label">Current password</label>
          <Link href="/forgot-password" className="mb-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
            Forgot it?
          </Link>
        </div>
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" required
          invalid={Boolean(errors.currentPassword)} aria-describedby="currentPassword-hint" />
        {hint("currentPassword", "")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="newPassword" className="label">New password</label>
          <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" required
            invalid={Boolean(errors.newPassword)} aria-describedby="newPassword-hint" />
          {hint("newPassword", "At least 8 characters.")}
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="label">Confirm new password</label>
          <PasswordInput id="confirmNewPassword" name="confirmNewPassword" autoComplete="new-password" required
            invalid={Boolean(errors.confirmNewPassword)} aria-describedby="confirmNewPassword-hint" />
          {hint("confirmNewPassword", "Type the new password again.")}
        </div>
      </div>

      {formError && <p role="alert" className="error-text">{formError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "saving" || !ready} className="btn-primary">
          {!ready ? "Loading…" : status === "saving" ? "Changing…" : "Change password"}
        </button>
        <span aria-live="polite" className="text-sm text-primary">
          {status === "saved" ? "Password changed. Use your new password next time you log in." : ""}
        </span>
      </div>
    </form>
  );
}
