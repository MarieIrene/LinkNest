import { Bone, LoadingLabel } from "@/components/Skeleton";

/** Shown inside the admin frame (menu stays visible) while a page's data loads. */
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <LoadingLabel />
      <div>
        <Bone className="h-9 w-48" />
        <Bone className="mt-3 h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Bone key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Bone className="h-40 rounded-2xl" />
    </div>
  );
}
