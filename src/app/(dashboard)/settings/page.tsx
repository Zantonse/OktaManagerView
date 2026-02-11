import { SettingsContent } from "@/components/settings/settings-content";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account settings</p>
      </div>

      <SettingsContent />
    </div>
  );
}
