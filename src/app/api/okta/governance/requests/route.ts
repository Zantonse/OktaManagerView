import { auth } from "@/lib/auth";
import { getAccessRequestsWithPagination } from "@/lib/okta/client";
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
    const { data: requests, nextCursor } = await getAccessRequestsWithPagination({ status, after, limit });
    return NextResponse.json({ data: requests, nextCursor });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch access requests" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
