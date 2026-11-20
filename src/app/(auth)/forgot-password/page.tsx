import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="panel">
      <h1 className="font-display text-3xl font-bold text-primary">Forgot your password?</h1>
      <p className="mb-6 mt-2 text-ink/70">Enter the email you signed up with and we&apos;ll send you a link to choose a new one.</p>
      <ForgotPasswordForm />
    </div>
  );
}
