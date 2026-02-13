import { auth } from "@/lib/auth";
import { deleteDelegateAsUser } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.accessToken) {
    return NextResponse.json({ error: "No access token available" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteDelegateAsUser(session.accessToken, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting delegate:", error);
    const statusCode = (error as any)?.statusCode || 500;
    const errorMessage =
      (error as any)?.errorSummary ||
      (error as any)?.getUserFriendlyMessage?.() ||
      "Failed to delete delegate";

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
