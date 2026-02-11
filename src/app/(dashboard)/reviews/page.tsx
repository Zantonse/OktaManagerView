import { ReviewsContent } from "@/components/reviews/reviews-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Access Reviews</h1>
        <p className="text-muted-foreground">Initiate and manage access reviews for your team</p>
      </div>

      <div className="flex gap-2">
        <Link href="/reviews/create">
          <Button>Create Review</Button>
        </Link>
      </div>

      <ReviewsContent />
    </div>
  );
}
