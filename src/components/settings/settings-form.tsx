"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";

interface AppSettings {
  id: string;
  geminiApiKey: string | null;
  defaultLabTemplate: string | null;
  locale: string;
}

interface SettingsFormProps {
  settings: AppSettings | null;
  action: (formData: FormData) => Promise<void>;
}

export function SettingsForm({ settings, action }: SettingsFormProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Manage your API keys and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <Label htmlFor="geminiApiKey">Google Gemini API Key</Label>
            <div className="relative">
              <Input
                id="geminiApiKey"
                name="geminiApiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="AIza..."
                defaultValue={settings?.geminiApiKey ?? ""}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Required for Gemini Vision OCR. Your API key is used to extract
              blood test results from uploaded images using Google&apos;s
              Gemini model. Get your key at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 hover:text-foreground"
              >
                aistudio.google.com
              </a>
              .
            </p>
          </div>

          {/* Locale */}
          <div className="space-y-2">
            <Label htmlFor="locale">Locale</Label>
            <Select
              name="locale"
              defaultValue={settings?.locale ?? "en"}
            >
              <SelectTrigger id="locale" className="w-full">
                <SelectValue placeholder="Select locale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="th">Thai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
