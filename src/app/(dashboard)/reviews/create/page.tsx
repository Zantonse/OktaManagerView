import { CreateReviewForm } from "@/components/reviews/create-review-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateReviewPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Link href="/reviews">
          <Button variant="ghost" className="w-fit px-0 h-auto text-muted-foreground hover:text-foreground">
            ← Back to Reviews
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Access Review</h1>
      </div>

      <CreateReviewForm />
    </div>
  );
}
