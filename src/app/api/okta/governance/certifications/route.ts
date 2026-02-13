import { auth } from "@/lib/auth";
import { getCampaigns, getReviewsWithPagination } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

// Fetch all reviews for a campaign, paginating through all pages.
async function getAllReviewsForCampaign(campaignId: string): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let after: string | undefined;
  const filter = `campaignId eq "${campaignId}"`;

  do {
    const { data, nextCursor } = await getReviewsWithPagination({ filter, after, limit: "200" });
    all.push(...(data as Record<string, unknown>[]));
    after = nextCursor;
  } while (after);

  return all;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const pendingOnly = searchParams.get("pendingOnly") === "true";
  const countOnly = searchParams.get("countOnly") === "true";
  const campaignIdParam = searchParams.get("campaignId");

  try {
    // Step 1: Get all campaigns via SSWS admin token, filter to ACTIVE
    const allCampaigns = await getCampaigns({ limit: "200" });
    const activeCampaigns = allCampaigns.filter((c) => c.status === "ACTIVE");

    // Step 2: For each active campaign, fetch reviews filtered by campaignId
    // and reviewerId using SCIM filters (per Okta docs recommendation).
    const reviewsByCampaign = await Promise.all(
      activeCampaigns
        .filter((c) => !campaignIdParam || c.id === campaignIdParam)
        .map(async (campaign) => {
          try {
            const reviews = await getAllReviewsForCampaign(campaign.id);
            // Filter to this user's reviews and optionally by decision
            const filtered = reviews.filter((r) => {
              const profile = r.reviewerProfile as { id?: string } | undefined;
              if (profile?.id !== userId) return false;
              if (pendingOnly && r.decision !== "UNREVIEWED") return false;
              return true;
            });
            return { campaign, reviews: filtered };
          } catch {
            return { campaign, reviews: [] as Record<string, unknown>[] };
          }
        })
    );

    // Flatten all reviews and compute total count
    const allReviews = reviewsByCampaign.flatMap((r) => r.reviews);

    // If only the count is needed (dashboard), skip enrichment
    if (countOnly) {
      return NextResponse.json({ count: allReviews.length });
    }

    // Build campaign summaries
    const campaigns = reviewsByCampaign
      .filter((r) => r.reviews.length > 0)
      .map((r) => ({
        id: r.campaign.id,
        name: r.campaign.name,
        pendingCount: r.reviews.length,
        dueDate: r.campaign.scheduleSettings?.endDate ?? r.campaign.deadline ?? null,
      }));

    // Sort by due date (soonest first)
    campaigns.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return NextResponse.json({
      campaigns,
      totalPendingReviews: allReviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch reviews" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
