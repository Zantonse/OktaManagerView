import { RequestQueueContent } from "@/components/requests/request-queue-content";

export default function RequestsPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Access Requests</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review and respond to access requests from your team
          </p>
        </div>
        <RequestQueueContent />
      </div>
    </div>
  );
}
