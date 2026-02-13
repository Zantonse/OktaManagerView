import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:flex-shrink-0">
        <Sidebar session={session} />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <nav className="bg-card/80 backdrop-blur-sm border-b border-border">
          <TopNav session={session} />
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav session={session} />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
