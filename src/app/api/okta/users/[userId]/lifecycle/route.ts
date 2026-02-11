import { auth } from "@/lib/auth";
import { getUser, suspendUser, unsuspendUser } from "@/lib/okta/client";
import { userLifecycleActionSchema } from "@/lib/validations/okta";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
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
    let validatedData: z.infer<typeof userLifecycleActionSchema>;
    try {
      validatedData = userLifecycleActionSchema.parse(body);
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

    const { action } = validatedData;

    // Execute lifecycle action
    if (action === "suspend") {
      await suspendUser(userId);
    } else if (action === "unsuspend") {
      await unsuspendUser(userId);
    }

    // Fetch and return updated user
    const updatedUser = await getUser(userId);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error performing lifecycle action:", error);
    const statusCode = (error as any)?.statusCode || 500;
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to perform lifecycle action" },
      { status: statusCode }
    );
  }
}
