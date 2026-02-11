import { auth } from "@/lib/auth";
import { getUser, appointDelegate } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    // Verify the user exists and is a direct report
    const user = await getUser(userId);
    if (user.profile.managerId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { ptoStartDate, ptoEndDate, delegateId, note } = body;

    if (!delegateId) {
      return NextResponse.json(
        { error: "A delegate is required" },
        { status: 400 }
      );
    }

    const fullName = `${user.profile.firstName} ${user.profile.lastName}`;
    const delegateNote = note || `${fullName} is on PTO, and you have been appointed to cover for this duration. Thank you!`;

    const result = await appointDelegate(userId, {
      delegateId,
      note: delegateNote,
      startTime: `${ptoStartDate}T08:00:00.000Z`,
      endTime: `${ptoEndDate}T08:00:00.000Z`,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error assigning delegate:", error);
    const statusCode = (error as any)?.statusCode || 500;
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to assign delegate" },
      { status: statusCode }
    );
  }
}
