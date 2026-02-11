import { ReviewsContent } from "@/components/reviews/reviews-content";

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Access Reviews</h1>
        <p className="text-muted-foreground">
          Manage campaigns and review certification tasks
        </p>
      </div>

      <ReviewsContent />
    </div>
  );
}
