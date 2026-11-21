import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthFormSkeleton } from "@/components/Skeleton";

export const metadata: Metadata = { title: "Create your page" };

/** Pre-built at deploy time so it opens instantly; the form reads ?username= in the browser. */
export default function RegisterPage() {
  return (
    <div className="panel">
      <h1 className="font-display text-3xl font-bold text-primary">Create your page</h1>
      <p className="mb-6 mt-2 text-ink/70">Free, and ready in under a minute.</p>
      <Suspense fallback={<AuthFormSkeleton fields={4} />}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
