"use client";

import { OktaCampaign } from "@/types/okta";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";

interface ReviewsListProps {
  campaigns: OktaCampaign[];
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  BUILDING: "bg-yellow-100 text-yellow-800",
  LAUNCHING: "bg-purple-100 text-purple-800",
};

export function ReviewsList({ campaigns }: ReviewsListProps) {
  const router = useRouter();

  const handleViewDetails = (id: string) => {
    router.push(`/certifications?campaignId=${id}`);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell
                className="font-medium"
                onClick={() => handleViewDetails(campaign.id)}
              >
                <div>
                  <p className="font-semibold">{campaign.name}</p>
                  {campaign.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {campaign.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[campaign.status] || "bg-gray-100 text-gray-800"}>
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(campaign.created)}</TableCell>
              <TableCell>{formatDate(campaign.deadline)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(campaign.id)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
