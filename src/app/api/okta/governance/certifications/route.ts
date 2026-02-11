import { auth } from "@/lib/auth";
import { getCertificationTasks } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  if (!campaignId) {
    return NextResponse.json(
      { error: "campaignId is required" },
      { status: 400 }
    );
  }

  try {
    const tasks = await getCertificationTasks(campaignId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching certification tasks:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch certification tasks" },
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
    const { certificationId, decision, justification } = body;

    if (!certificationId || !decision) {
      return NextResponse.json(
        { error: "certificationId and decision are required" },
        { status: 400 }
      );
    }

    // TODO: Implement certification decision submission
    // This would call the Okta API to update the certification task
    // For now, return a placeholder response
    return NextResponse.json({
      id: certificationId,
      decision,
      justification,
      completedDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to update certification" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
