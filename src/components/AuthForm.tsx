"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/client-api";
import { useHydrated } from "@/lib/use-hydrated";
import { PasswordInput } from "./PasswordInput";

type Mode = "login" | "register";

export function AuthForm({ mode, defaultUsername = "", next }: { mode: Mode; defaultUsername?: string; next?: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", username: defaultUsername, password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";
  const ready = useHydrated();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);

    // The inputs are uncontrolled so React never wipes text typed (or autofilled)
    // before the page finished loading; read what's actually in the boxes.
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const current = {
      email: String(form.get("email") ?? ""),
      username: String(form.get("username") ?? values.username),
      password: String(form.get("password") ?? ""),
    };
    setValues({ ...current, password: "" });

    if (isRegister) {
      const confirm = String(form.get("confirmPassword") ?? "");
      if (!confirm) {
        setErrors({ confirmPassword: "Type your password again." });
        setPending(false);
        return;
      }
      if (confirm !== current.password) {
        setErrors({ confirmPassword: "The two passwords don't match. Type the same password in both boxes." });
        setPending(false);
        return;
      }
    }

    const body = isRegister ? current : { email: current.email, password: current.password };
    const res = await apiRequest<{ redirect?: string }>(`/api/auth/${mode}`, { method: "POST", body });

    if (!res.ok) {
      setErrors(res.fields);
      setFormError(res.error);
      setPending(false);
      return;
    }
    router.replace(next ?? res.data.redirect ?? "/dashboard");
    router.refresh();
  }

  const fieldClass = (key: string) => `field ${errors[key] ? "field-error" : ""}`;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={values.email}
          className={fieldClass("email")} aria-invalid={Boolean(errors.email)} aria-describedby="email-error" />
        {errors.email && <p id="email-error" className="error-text">{errors.email}</p>}
      </div>

      {isRegister && (
        <div>
          <label htmlFor="username" className="label">Username</label>
          <input id="username" name="username" autoComplete="username" required defaultValue={values.username}
            className={fieldClass("username")} aria-invalid={Boolean(errors.username)} aria-describedby="username-hint" spellCheck={false} />
          <p id="username-hint" className={errors.username ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
            {errors.username ?? "This becomes your page address. Letters, numbers, dots and underscores."}
          </p>
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="label">Password</label>
          {!isRegister && (
            <Link href="/forgot-password" className="mb-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          )}
        </div>
        <PasswordInput id="password" name="password" required autoComplete={isRegister ? "new-password" : "current-password"}
          defaultValue="" invalid={Boolean(errors.password)} aria-describedby="password-hint" />
        <p id="password-hint" className={errors.password ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
          {errors.password ?? (isRegister ? "At least 8 characters." : "")}
        </p>
      </div>

      {isRegister && (
        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <PasswordInput id="confirmPassword" name="confirmPassword" required autoComplete="new-password"
            defaultValue="" invalid={Boolean(errors.confirmPassword)} aria-describedby="confirm-hint" />
          <p id="confirm-hint" className={errors.confirmPassword ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
            {errors.confirmPassword ?? "Type the same password again."}
          </p>
        </div>
      )}

      <button type="submit" disabled={pending || !ready} className="btn-press w-full">
        {!ready ? "Loading…" : pending ? (isRegister ? "Creating your page…" : "Logging in…") : isRegister ? "Create my page" : "Log in"}
      </button>

      <p className="text-center text-sm text-ink/70">
        {isRegister ? "Already have a page? " : "New here? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-primary underline-offset-4 hover:underline">
          {isRegister ? "Log in" : "Create your page"}
        </Link>
      </p>
    </form>
  );
}
