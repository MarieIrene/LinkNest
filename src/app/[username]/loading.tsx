import { LoadingLabel } from "@/components/Skeleton";

/** Shown the instant a profile (or tapped card) opens, until the profile arrives. */
export default function ProfileLoading() {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-primary px-5 pt-12">
      <LoadingLabel text="Loading profile" />
      <div className="h-24 w-24 animate-pulse rounded-full bg-white/15" />
      <div className="mt-5 h-8 w-48 animate-pulse rounded-lg bg-white/20" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/15" />
      <div className="mt-9 flex w-full max-w-md flex-col gap-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-14 animate-pulse rounded-full bg-secondary/30" />)}
      </div>
    </main>
  );
}
