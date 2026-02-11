import { auth } from "@/lib/auth";
import { getUser, getUserGroups } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    // Verify user is a direct report
    const user = await getUser(userId);
    if (user.profile.managerId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user's groups
    const groups = await getUserGroups(userId);
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    const statusCode = (error as any)?.statusCode || 500;
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch user groups" },
      { status: statusCode }
    );
  }
}
