"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/client-api";

type Mode = "login" | "register";

export function AuthForm({ mode, defaultUsername = "", next }: { mode: Mode; defaultUsername?: string; next?: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", username: defaultUsername, password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  const update = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);

    const body = isRegister ? values : { email: values.email, password: values.password };
    const res = await apiRequest(`/api/auth/${mode}`, { method: "POST", body });

    if (!res.ok) {
      setErrors(res.fields);
      setFormError(res.error);
      setPending(false);
      return;
    }
    router.replace(next ?? "/dashboard");
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
        <input id="email" type="email" autoComplete="email" required value={values.email} onChange={update("email")}
          className={fieldClass("email")} aria-invalid={Boolean(errors.email)} aria-describedby="email-error" />
        {errors.email && <p id="email-error" className="error-text">{errors.email}</p>}
      </div>

      {isRegister && (
        <div>
          <label htmlFor="username" className="label">Username</label>
          <input id="username" autoComplete="username" required value={values.username} onChange={update("username")}
            className={fieldClass("username")} aria-invalid={Boolean(errors.username)} aria-describedby="username-hint" spellCheck={false} />
          <p id="username-hint" className={errors.username ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
            {errors.username ?? "This becomes your page address. Letters, numbers, dots and underscores."}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" type="password" required autoComplete={isRegister ? "new-password" : "current-password"}
          value={values.password} onChange={update("password")} className={fieldClass("password")}
          aria-invalid={Boolean(errors.password)} aria-describedby="password-hint" />
        <p id="password-hint" className={errors.password ? "error-text" : "mt-1.5 text-sm text-ink/55"}>
          {errors.password ?? (isRegister ? "At least 8 characters." : "")}
        </p>
      </div>

      <button type="submit" disabled={pending} className="btn-press w-full">
        {pending ? (isRegister ? "Creating your page…" : "Logging in…") : isRegister ? "Create my page" : "Log in"}
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
