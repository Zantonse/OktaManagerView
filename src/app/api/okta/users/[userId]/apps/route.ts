import { auth } from "@/lib/auth";
import { getUser, getUserAppLinks, getAppUserEntitlements } from "@/lib/okta/client";
import { getFriendlyRoleLabel } from "@/lib/okta/app-labels";
import { NextRequest, NextResponse } from "next/server";

interface AppWithRole {
  id: string;
  label: string;
  linkUrl: string;
  logoUrl: string;
  appName: string;
  appInstanceId: string;
  role: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || undefined;

  try {
    // Verify user is a direct report
    const user = await getUser(userId);
    if (user.profile.managerId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user's app links
    const appLinks = await getUserAppLinks(userId);

    // Fetch entitlements for each app in parallel
    const entitlementPromises = appLinks.map((appLink) =>
      getAppUserEntitlements(appLink.appInstanceId, userId)
        .then((appUser) => {
          const role = getFriendlyRoleLabel(
            appLink.appName,
            appUser.scope || "User"
          );
          return { ...appLink, role } as AppWithRole;
        })
        .catch(() => {
          // If entitlement fetch fails, use "User" as fallback
          return { ...appLink, role: "User" } as AppWithRole;
        })
    );

    const appsWithRoles = await Promise.all(entitlementPromises);

    // Filter by search if provided
    let filtered = appsWithRoles;
    if (search) {
      filtered = appsWithRoles.filter(
        (app) =>
          app.label.toLowerCase().includes(search) ||
          app.appName.toLowerCase().includes(search) ||
          app.role.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching user apps:", error);
    const statusCode = (error as any)?.statusCode || 500;
    return NextResponse.json(
      { error: (error as any)?.getUserFriendlyMessage?.() || "Failed to fetch user apps" },
      { status: statusCode }
    );
  }
}
