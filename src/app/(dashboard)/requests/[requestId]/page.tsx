import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestDetailPage } from "@/components/requests/request-detail-page";

export default function RequestDetailRoute({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/requests" className="inline-block mb-6">
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Requests
          </Button>
        </Link>

        {/* Request Detail */}
        <RequestDetailPage params={params} />
      </div>
    </div>
  );
}
