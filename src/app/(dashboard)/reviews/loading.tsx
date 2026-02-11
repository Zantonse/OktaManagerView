import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsLoading() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>

      {/* Create Button */}
      <Skeleton className="h-10 w-32" />

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block space-y-3">
        <Skeleton className="h-10 w-full rounded-t-lg" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>

      {/* Mobile Card Skeleton */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
