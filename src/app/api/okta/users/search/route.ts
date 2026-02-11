import { auth } from "@/lib/auth";
import { searchAllUsers } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = searchParams.get("limit") || "10";

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  try {
    const users = await searchAllUsers(query.trim(), { limit });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    const statusCode = (error as any)?.statusCode || 500;
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to search users" },
      { status: statusCode }
    );
  }
}
