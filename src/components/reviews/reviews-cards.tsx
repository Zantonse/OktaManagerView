"use client";

import { OktaCampaign } from "@/types/okta";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";

interface ReviewsCardsProps {
  campaigns: OktaCampaign[];
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  BUILDING: "bg-yellow-100 text-yellow-800",
  LAUNCHING: "bg-purple-100 text-purple-800",
};

export function ReviewsCards({ campaigns }: ReviewsCardsProps) {
  const router = useRouter();

  const handleViewDetails = (id: string) => {
    router.push(`/certifications?campaignId=${id}`);
  };

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold">{campaign.name}</h3>
                {campaign.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {campaign.description}
                  </p>
                )}
              </div>
              <Badge className={statusColors[campaign.status] || "bg-gray-100 text-gray-800"}>
                {campaign.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(campaign.created)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Deadline</p>
                <p className="font-medium">{formatDate(campaign.deadline)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleViewDetails(campaign.id)}
            >
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
