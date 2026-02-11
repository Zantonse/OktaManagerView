import { auth } from "@/lib/auth";
import { getDirectReports } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const after = searchParams.get("after") || undefined;
  const limit = searchParams.get("limit") || "200";

  try {
    const users = await getDirectReports(session.user.email, { search, status, after, limit });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching direct reports:", error);
    const statusCode = (error as any)?.statusCode || 500;
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch team members" },
      { status: statusCode }
    );
  }
}
