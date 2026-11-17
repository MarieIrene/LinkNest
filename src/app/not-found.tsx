import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="on-dark flex min-h-dvh flex-col items-center justify-center bg-primary px-5 text-center text-white">
      <Logo dark />
      <h1 className="mt-10 font-display text-4xl font-bold">This page doesn&apos;t exist.</h1>
      <p className="mt-3 max-w-[40ch] text-white/75">
        Check the spelling of the link. If the name is free, it could be yours.
      </p>
      <Link href="/register" className="btn-press mt-8">Create your page</Link>
    </main>
  );
}
