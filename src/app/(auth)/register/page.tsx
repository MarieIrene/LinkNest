import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create your page" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ username?: string }> }) {
  const { username } = await searchParams;

  return (
    <div className="panel">
      <h1 className="font-display text-3xl font-bold text-primary">Create your page</h1>
      <p className="mb-6 mt-2 text-ink/70">Free, and ready in under a minute.</p>
      <AuthForm mode="register" defaultUsername={username?.toLowerCase().slice(0, 30) ?? ""} />
    </div>
  );
}
