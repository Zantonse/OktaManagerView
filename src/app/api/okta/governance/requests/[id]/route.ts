import { auth } from "@/lib/auth";
import { updateAccessRequest } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

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
    const { status, comment } = body;

    if (!status || !["APPROVED", "DENIED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be APPROVED or DENIED." }, { status: 400 });
    }

    const result = await updateAccessRequest(id, { status: status as 'APPROVED' | 'DENIED', comment });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating access request:", error);
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to update access request" },
      { status: (error as any)?.statusCode || 500 }
    );
  }
}
