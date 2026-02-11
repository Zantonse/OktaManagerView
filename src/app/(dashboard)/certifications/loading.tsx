import { Skeleton } from "@/components/ui/skeleton";

export default function CertificationsLoading() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>

      {/* Campaign Selector */}
      <Skeleton className="h-10 w-full md:w-48" />

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
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
