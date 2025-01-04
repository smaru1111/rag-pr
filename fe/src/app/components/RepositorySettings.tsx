'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RepoSettings } from '@/lib/cosmosdb';

type ReviewStyle = RepoSettings['review_style'];
type Language = RepoSettings['language'];

interface RepositorySettingsProps {
  repoId: number;
  initialSettings?: RepoSettings;
  onSave: (settings: RepoSettings) => Promise<void>;
}

export function RepositorySettings({ repoId, initialSettings, onSave }: RepositorySettingsProps) {
  const [settings, setSettings] = useState<RepoSettings>({
    is_enabled: initialSettings?.is_enabled ?? false,
    review_style: initialSettings?.review_style ?? 'friendly',
    language: initialSettings?.language ?? 'en',
    focus_areas: initialSettings?.focus_areas ?? [],
    repo_id: repoId,
    owner_id: initialSettings?.owner_id ?? '',
    id: initialSettings?.id ?? '',
    full_name: initialSettings?.full_name ?? '',
    created_at: initialSettings?.created_at ?? new Date(),
    updated_at: initialSettings?.updated_at ?? new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...settings
    });
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>Bot Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-enabled"
              checked={settings.is_enabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, is_enabled: checked as boolean })
              }
            />
            <Label htmlFor="is-enabled">Enable RAG PR Bot</Label>
          </div>

          <div className="space-y-2">
            <Label>Review Style</Label>
            <Select
              value={settings.review_style}
              onValueChange={(value) => 
                setSettings({ ...settings, review_style: value as ReviewStyle })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select review style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => 
                setSettings({ ...settings, language: value as Language })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit">Save Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
} 