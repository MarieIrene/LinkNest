import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Only allow redirects back into this app.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <div className="panel">
      <h1 className="font-display text-3xl font-bold text-primary">Log in</h1>
      <p className="mb-6 mt-2 text-ink/70">Manage your links and see how they perform.</p>
      <AuthForm mode="login" next={safeNext} />
    </div>
  );
}
