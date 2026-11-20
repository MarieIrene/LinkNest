import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/PasswordResetForms";

export const metadata: Metadata = { title: "Choose a new password", referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="panel">
      <h1 className="font-display text-3xl font-bold text-primary">Choose a new password</h1>
      {token ? (
        <>
          <p className="mb-6 mt-2 text-ink/70">Pick something you haven&apos;t used before.</p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <p className="mt-3 text-ink/70">
          This link is incomplete. Open the link from your email again, or{" "}
          <Link href="/forgot-password" className="font-semibold text-primary underline-offset-4 hover:underline">ask for a new one</Link>.
        </p>
      )}
    </div>
  );
}
