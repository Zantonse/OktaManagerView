import { auth } from "@/lib/auth";
import { getCampaigns, createCampaign } from "@/lib/okta/client";
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
    const campaigns = await getCampaigns({ status, after, limit });
    return NextResponse.json(campaigns);
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

    // Set scheduledStartDate to now and deadline to 48 hours from now
    const now = new Date();
    const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const campaign = await createCampaign({
      name,
      description,
      scheduledStartDate: now.toISOString(),
      deadline: deadline.toISOString(),
      resourceSets: userIds ? [{ resources: userIds }] : undefined,
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to create campaign" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
