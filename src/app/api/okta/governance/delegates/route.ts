import { auth } from "@/lib/auth";
import { getDelegatesAsUser, createDelegateAsUser } from "@/lib/okta/client";
import { createDelegateSchema } from "@/lib/validations/okta";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.accessToken) {
    return NextResponse.json({ error: "No access token available" }, { status: 401 });
  }

  try {
    const delegates = await getDelegatesAsUser(session.accessToken);
    return NextResponse.json({ delegates, warning: undefined });
  } catch (error) {
    console.warn("Delegates API not available (Beta):", error);
    return NextResponse.json({
      delegates: [],
      warning: "Delegates API is not available in your Okta organization",
    });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.accessToken) {
    return NextResponse.json({ error: "No access token available" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate request body
    let validatedData: z.infer<typeof createDelegateSchema>;
    try {
      validatedData = createDelegateSchema.parse(body);
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

    const { delegateId, scope, startDate, endDate } = validatedData;

    const delegate = await createDelegateAsUser(session.accessToken, {
      delegateId,
      scope,
      startDate,
      endDate,
    });

    return NextResponse.json(delegate);
  } catch (error) {
    console.error("Error creating delegate:", error);
    const statusCode = (error as any)?.statusCode || 500;
    const errorMessage =
      (error as any)?.errorSummary ||
      (error as any)?.getUserFriendlyMessage?.() ||
      "Failed to create delegate";

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
