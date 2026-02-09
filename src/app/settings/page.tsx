export const dynamic = "force-dynamic";

import { getSettings, updateSettings } from "@/app/actions";
import { SettingsForm } from "@/components/settings/settings-form";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="size-7 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure application settings
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <SettingsForm settings={settings} action={updateSettings} />
      </div>
    </div>
  );
}
