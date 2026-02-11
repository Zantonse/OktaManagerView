import { auth } from "@/lib/auth";
import { getUser, updateUserProfile } from "@/lib/okta/client";
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
    const { onPTO, ptoStartDate, ptoEndDate } = body;

    // Update the user profile
    const profileUpdate: Record<string, any> = {};

    if (onPTO) {
      // Setting PTO on
      profileUpdate.onPTO = true;
      profileUpdate.ptoStartDate = ptoStartDate;
      profileUpdate.ptoEndDate = ptoEndDate;
    } else {
      // Clearing PTO
      profileUpdate.onPTO = false;
      profileUpdate.ptoStartDate = null;
      profileUpdate.ptoEndDate = null;
    }

    const updatedUser = await updateUserProfile(userId, profileUpdate);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating PTO status:", error);
    const statusCode = (error as any)?.statusCode || 500;
    const errorMessage = (error as any)?.message || "";

    // Okta returns 400 with "userProfile" validation error when custom attributes
    // (onPTO, ptoStartDate, ptoEndDate) are not defined in the org's Universal Directory schema
    if (statusCode === 400 && errorMessage.includes("userProfile")) {
      return NextResponse.json(
        { error: "PTO custom attributes are not configured in your Okta org. An admin needs to add onPTO, ptoStartDate, and ptoEndDate to the User profile schema." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to update PTO status" },
      { status: statusCode }
    );
  }
}
