"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingRow {
  id: string;
  key: string;
  value: Record<string, string> | null;
  updated_at: string;
}

/** Friendly labels & descriptions for known settings keys */
const SETTING_META: Record<string, { label: string; description: string }> = {
  ivr_greeting: {
    label: "IVR Greeting",
    description:
      "The initial greeting callers hear when they connect (Urdu & English).",
  },
  business_hours_default: {
    label: "Default Business Hours",
    description: "Start/end times and timezone used when a department doesn't specify its own hours.",
  },
  after_hours_message: {
    label: "After‑Hours Message",
    description: "Message played when callers reach the system outside business hours.",
  },
};

// ---------------------------------------------------------------------------
// Single Setting Card
// ---------------------------------------------------------------------------

function SettingCard({
  setting,
  onSaved,
}: {
  setting: SettingRow;
  onSaved: () => void;
}) {
  const meta = SETTING_META[setting.key];
  const [fields, setFields] = useState<Record<string, string>>(
    (setting.value as Record<string, string>) ?? {},
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (fieldKey: string, val: string) => {
    setFields((prev) => ({ ...prev, [fieldKey]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: setting.key, value: fields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast.success(`"${meta?.label ?? setting.key}" updated`);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-dc-navy">
          {meta?.label ?? setting.key}
        </CardTitle>
        {meta?.description && (
          <CardDescription>{meta.description}</CardDescription>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 pt-4">
        {Object.entries(fields).map(([fieldKey, fieldVal]) => (
          <div key={fieldKey} className="space-y-1">
            <Label htmlFor={`${setting.key}-${fieldKey}`} className="capitalize">
              {fieldKey.replace(/_/g, " ")}
            </Label>
            <Input
              id={`${setting.key}-${fieldKey}`}
              value={fieldVal}
              onChange={(e) => handleChange(fieldKey, e.target.value)}
            />
          </div>
        ))}
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="bg-dc-blue text-white hover:bg-dc-blue-dark"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setSettings(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-dc-navy">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage IVR greetings, business hours, and system configuration.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-dc-blue" />
        </div>
      ) : settings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <SettingsIcon className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-dc-navy">
            No settings found
          </p>
          <p className="text-sm text-muted-foreground">
            Run the seed SQL to populate default settings.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {settings.map((s) => (
            <SettingCard key={s.id} setting={s} onSaved={fetchAll} />
          ))}
        </div>
      )}
    </div>
  );
}
