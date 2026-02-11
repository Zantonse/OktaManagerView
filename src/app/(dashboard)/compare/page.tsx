import { AccessComparison } from "@/components/team/access-comparison";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ComparePageProps {
  searchParams: Promise<{ users?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { users } = await searchParams;
  const userIds = users?.split(",").filter(Boolean) ?? [];

  if (userIds.length !== 2) {
    return (
      <div className="space-y-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select exactly 2 team members to compare their access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare Access</h1>
        <p className="text-sm text-muted-foreground mt-1">Side-by-side view of apps, roles, and groups</p>
      </div>
      <AccessComparison userIdA={userIds[0]} userIdB={userIds[1]} />
    </div>
  );
}
