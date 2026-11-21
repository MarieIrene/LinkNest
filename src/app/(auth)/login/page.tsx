import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthFormSkeleton } from "@/components/Skeleton";

export const metadata: Metadata = { title: "Log in" };

/** Pre-built at deploy time so it opens instantly; the form reads ?next= in the browser. */
export default function LoginPage() {
  return (
    <div className="panel">
      <h1 className="font-display text-3xl font-bold text-primary">Log in</h1>
      <p className="mb-6 mt-2 text-ink/70">Manage your links and see how they perform.</p>
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
