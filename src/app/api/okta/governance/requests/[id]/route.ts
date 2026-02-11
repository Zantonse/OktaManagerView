import { auth } from "@/lib/auth";
import { updateAccessRequest } from "@/lib/okta/client";
import { accessRequestUpdateSchema } from "@/lib/validations/okta";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    // Validate request body
    let validatedData: z.infer<typeof accessRequestUpdateSchema>;
    try {
      validatedData = accessRequestUpdateSchema.parse(body);
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

    const { status, comment } = validatedData;

    const result = await updateAccessRequest(id, { status, comment });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating access request:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to update access request" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
