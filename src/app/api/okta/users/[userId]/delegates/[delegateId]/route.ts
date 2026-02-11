import { auth } from "@/lib/auth";
import { getUser, deleteDelegate } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; delegateId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, delegateId } = await params;

  try {
    // Verify the user exists and is a direct report
    const user = await getUser(userId);
    if (user.profile.managerId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the delegate appointment
    await deleteDelegate(delegateId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting delegate:", error);
    const statusCode = (error as any)?.statusCode || 500;
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to delete delegate" },
      { status: statusCode }
    );
  }
}
