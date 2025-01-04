'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Repository } from '@/types/repository';

interface RepositorySettingsProps {
  repo: Repository;
  onSave: (repos: Repository) => Promise<void>;
}

export function RepositorySettings({repo, onSave }: RepositorySettingsProps) {
  const [settings, setSettings] = useState<Repository>({
    id: repo.id,
    repo_id: repo.repo_id,
    is_enabled: repo.is_enabled,
    review_style: repo.review_style,
    language: repo.language,
    focus_areas: repo.focus_areas,
    owner_id: repo.owner_id,
    full_name: repo.full_name,
    description: repo.description,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(settings);
    } finally {
      setIsSaving(false);
    }
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
                setSettings({ ...settings, review_style: value as 'strict' | 'friendly' | 'casual' })
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
                setSettings({ ...settings, language: value as 'en' | 'ja' })
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

          <Button disabled={isSaving} type="submit">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 