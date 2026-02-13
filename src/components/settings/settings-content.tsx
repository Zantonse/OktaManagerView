"use client";

import { Card } from "@/components/ui/card";
import { DelegateManager } from "./delegate-manager";
import { DelegateList } from "./delegate-list";

export function SettingsContent() {
  return (
    <div className="space-y-6">
      {/* Governance Delegates Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Governance Delegates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Delegate your governance responsibilities to other users during absences or for specific scopes
          </p>
        </div>

        {/* Delegate Manager */}
        <div className="grid gap-6 md:grid-cols-2">
          <DelegateManager />
          <DelegateList />
        </div>
      </div>
    </div>
  );
}
