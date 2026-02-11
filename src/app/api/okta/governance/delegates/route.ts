import { auth } from "@/lib/auth";
import { getDelegates, createDelegate } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const delegates = await getDelegates();
    return NextResponse.json({ delegates, warning: undefined });
  } catch (error) {
    console.warn("Delegates API not available (Beta):", error);
    return NextResponse.json({
      delegates: [],
      warning: "Delegates API is not available in your Okta organization",
    });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { delegateId, scope, startDate, endDate } = body;

    if (!delegateId || !scope || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const delegate = await createDelegate({
      delegateId,
      scope,
      startDate,
      endDate,
    });

    return NextResponse.json(delegate);
  } catch (error) {
    console.error("Error creating delegate:", error);
    const statusCode = (error as any)?.statusCode || 500;
    const errorMessage =
      (error as any)?.errorSummary ||
      (error as any)?.getUserFriendlyMessage?.() ||
      "Failed to create delegate";

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
