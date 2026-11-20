"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/client-api";
import { useHydrated } from "@/lib/use-hydrated";
import { PasswordInput } from "./PasswordInput";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const ready = useHydrated();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const typed = String(new FormData(e.currentTarget as HTMLFormElement).get("email") ?? email);
    setEmail(typed);
    const res = await apiRequest("/api/auth/forgot-password", { method: "POST", body: { email: typed } });
    if (!res.ok) {
      setError(res.fields.email ?? res.error);
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div role="status" className="space-y-4">
        <p className="rounded-xl bg-secondary-soft px-4 py-3 text-primary-dark">
          If an account uses <strong>{email}</strong>, we&apos;ve sent it a link to reset your password.
          The link works for 1 hour.
        </p>
        <p className="text-sm text-ink/65">
          No email after a few minutes? Check your spam folder and make sure you typed the email you signed up
          with, then{" "}
          <button type="button" onClick={() => setStatus("idle")} className="font-semibold text-primary underline-offset-4 hover:underline">
            try again
          </button>. Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">Create your page</Link>.
        </p>
        <Link href="/login" className="btn-ghost -ml-4">Back to log in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={email}
          className={`field ${error ? "field-error" : ""}`} aria-invalid={Boolean(error)} aria-describedby="email-error" />
        {error && <p id="email-error" role="alert" className="error-text">{error}</p>}
      </div>
      <button type="submit" disabled={status === "sending" || !ready} className="btn-press w-full">
        {!ready ? "Loading…" : status === "sending" ? "Sending link…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-ink/70">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Log in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const ready = useHydrated();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      setErrors({ confirm: "The two passwords don't match." });
      return;
    }
    setPending(true);
    const res = await apiRequest("/api/auth/reset-password", { method: "POST", body: { token, password } });
    if (!res.ok) {
      setErrors(res.fields);
      if (!Object.keys(res.fields).length) setFormError(res.error);
      setPending(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}{" "}
          <Link href="/forgot-password" className="font-semibold underline">Get a new link</Link>
        </div>
      )}
      <div>
        <label htmlFor="password" className="label">New password</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" required
          invalid={Boolean(errors.password)} aria-describedby="password-hint" />
        <p id="password-hint" className={errors.password ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
          {errors.password ?? "At least 8 characters."}
        </p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirm new password</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required
          invalid={Boolean(errors.confirm)} aria-describedby="confirm-error" />
        {errors.confirm && <p id="confirm-error" className="error-text">{errors.confirm}</p>}
      </div>
      <button type="submit" disabled={pending || !ready} className="btn-press w-full">
        {!ready ? "Loading…" : pending ? "Saving…" : "Save new password and log in"}
      </button>
    </form>
  );
}
