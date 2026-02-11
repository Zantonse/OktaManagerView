import { auth } from "@/lib/auth";
import { getDelegateAppointments, getUser } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const appointments = await getDelegateAppointments(userId);

    // Resolve delegate user profiles in parallel
    const enriched = await Promise.all(
      appointments.map(async (appt) => {
        try {
          const user = await getUser(appt.delegate.externalId);
          const fullName = [user.profile.firstName, user.profile.lastName]
            .filter(Boolean)
            .join(" ");
          return {
            ...appt,
            delegateName: fullName || user.profile.email,
            delegateEmail: user.profile.email,
          };
        } catch {
          return appt;
        }
      })
    );

    return NextResponse.json({ appointments: enriched, warning: undefined });
  } catch (error) {
    console.warn("Delegate Appointments API not available (Beta):", error);
    return NextResponse.json({
      appointments: [],
      warning:
        "Delegate Appointments API is not available in your Okta organization",
    });
  }
}
