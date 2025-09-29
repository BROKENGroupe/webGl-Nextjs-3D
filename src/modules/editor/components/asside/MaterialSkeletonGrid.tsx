import { Skeleton } from "@/shared/ui/skeleton";

export function MaterialSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl bg-white p-5 w-full min-w-0"
          style={{ minHeight: "150px", margin: "0" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>
          <Skeleton className="w-20 h-3 mb-2 rounded" />
          <Skeleton className="w-32 h-3 mb-2 rounded" />
          <Skeleton className="w-16 h-3 mb-2 rounded" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}