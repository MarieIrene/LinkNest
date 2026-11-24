import { Bone, LoadingLabel } from "@/components/Skeleton";

/** Shown inside the dashboard frame the moment a section opens, until its content is ready. */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <LoadingLabel text="Loading your dashboard" />
      <div>
        <Bone className="h-8 w-64" />
        <Bone className="mt-3 h-4 w-80 max-w-full" />
      </div>
      <Bone className="h-28 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Bone className="h-56 rounded-2xl" />
    </div>
  );
}
