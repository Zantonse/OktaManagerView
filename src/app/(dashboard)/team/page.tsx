import { TeamContent } from "@/components/team/team-content";

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Manage your direct reports</p>
      </div>

      <TeamContent />
    </div>
  );
}
