import { auth } from "@/lib/auth";
import { getCertificationTasks, submitCertificationDecision } from "@/lib/okta/client";
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
    const { campaignId, certificationId, decision, justification } = body;

    if (!campaignId || !certificationId || !decision) {
      return NextResponse.json(
        { error: "campaignId, certificationId, and decision are required" },
        { status: 400 }
      );
    }

    const result = await submitCertificationDecision(campaignId, certificationId, {
      decision,
      ...(justification && { justification }),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to update certification" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
