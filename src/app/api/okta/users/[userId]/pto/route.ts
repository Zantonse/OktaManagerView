import { auth } from "@/lib/auth";
import { getUser, appointDelegate } from "@/lib/okta/client";
import { ptoAssignmentSchema } from "@/lib/validations/okta";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    // Validate request body
    let validatedData: z.infer<typeof ptoAssignmentSchema>;
    try {
      validatedData = ptoAssignmentSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validationError.issues,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    const { ptoStartDate, ptoEndDate, delegateId, note } = validatedData;

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
