import { MemberDetail } from "@/components/team/member-detail";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href="/team">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to team</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Member Details</h1>
      </div>

      <MemberDetail userId={userId} />
    </div>
  );
}
