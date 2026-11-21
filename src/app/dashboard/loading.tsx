import { Logo } from "@/components/Logo";
import { Bone, LoadingLabel } from "@/components/Skeleton";

/** Shown the instant someone opens their dashboard, until the data arrives. */
export default function DashboardLoading() {
  return (
    <div className="min-h-dvh">
      <LoadingLabel text="Loading your dashboard" />
      <header className="border-b border-line bg-paper/90">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Logo />
          <Bone className="ml-auto h-9 w-40" />
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-primary p-6">
            <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
            <div className="mt-3 h-8 w-64 animate-pulse rounded bg-white/25" />
          </div>
          <Bone className="h-8 w-24" />
          <Bone className="h-56" />
          <Bone className="h-24" />
          <Bone className="h-24" />
        </div>
        <Bone className="hidden h-[640px] rounded-[2.75rem] lg:block" />
      </main>
    </div>
  );
}
