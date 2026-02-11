"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
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

        {/* Beta API Warning */}
        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">Beta API Notice</p>
            <p className="text-sm text-yellow-700 mt-1">
              The Delegates API is in Beta and may not be available in all Okta organizations.
            </p>
          </div>
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
