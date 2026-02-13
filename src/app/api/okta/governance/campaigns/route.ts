import { auth } from "@/lib/auth";
import { getCampaignsWithPagination, createCampaign } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const after = searchParams.get("after") || undefined;
  const limit = searchParams.get("limit") || "50";

  try {
    const { data: campaigns, nextCursor } = await getCampaignsWithPagination({ status, after, limit });
    return NextResponse.json({ data: campaigns, nextCursor });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch campaigns" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, userIds } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const managerId = session.user.id;
    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID not available in session" },
        { status: 401 }
      );
    }

    // Start date must be in the future — add 2 minutes buffer
    const startDate = new Date(Date.now() + 2 * 60 * 1000);

    // Build a properly structured Okta Governance campaign payload
    const campaignPayload = {
      name,
      description: description || undefined,
      campaignType: "USER",
      scheduleSettings: {
        type: "ONE_OFF",
        startDate: startDate.toISOString(),
        durationInDays: 2,
        timeZone: "UTC",
      },
      resourceSettings: {
        type: "APPLICATION",
      },
      principalScopeSettings: {
        type: "USERS",
        ...(userIds && userIds.length > 0 ? { userIds } : {}),
      },
      reviewerSettings: {
        type: "USER",
        reviewerId: managerId,
        selfReviewDisabled: true,
      },
      remediationSettings: {
        accessApproved: "NO_ACTION",
        accessRevoked: "DENY",
        noResponse: "NO_ACTION",
      },
    };

    const campaign = await createCampaign(campaignPayload);
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    console.error("Error causes:", JSON.stringify((error as any)?.errorCauses, null, 2));
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to create campaign" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
