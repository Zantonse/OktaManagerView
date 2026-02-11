import { auth } from "@/lib/auth";
import { getDelegateAppointmentsBulk, getUser } from "@/lib/okta/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userIds = searchParams.get("userIds")?.split(",").filter(Boolean) ?? [];

  if (userIds.length === 0) {
    return NextResponse.json({ appointments: [] });
  }

  try {
    const appointments = await getDelegateAppointmentsBulk(userIds);

    // Resolve delegate user profiles in parallel
    const delegateIds = [...new Set(appointments.map((a) => a.delegate.externalId))];
    const userMap = new Map<string, { name: string; email: string }>();

    await Promise.all(
      delegateIds.map(async (id) => {
        try {
          const user = await getUser(id);
          const fullName = [user.profile.firstName, user.profile.lastName]
            .filter(Boolean)
            .join(" ");
          userMap.set(id, {
            name: fullName || user.profile.email,
            email: user.profile.email,
          });
        } catch {
          // If we can't resolve the user, skip enrichment
        }
      })
    );

    const enriched = appointments.map((appt) => {
      const resolved = userMap.get(appt.delegate.externalId);
      return {
        ...appt,
        ...(resolved && {
          delegateName: resolved.name,
          delegateEmail: resolved.email,
        }),
      };
    });

    return NextResponse.json({ appointments: enriched });
  } catch (error) {
    console.warn("Delegate Appointments bulk API not available:", error);
    return NextResponse.json({ appointments: [] });
  }
}
