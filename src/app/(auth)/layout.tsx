import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center px-5 py-10">
      <Logo />
      <main className="mt-10 w-full max-w-md">{children}</main>
    </div>
  );
}
