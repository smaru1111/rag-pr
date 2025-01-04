'use client';

import { useState } from 'react';
import type { RepoSettings } from '@/lib/cosmosdb';

type ReviewStyle = RepoSettings['review_style'];
type Language = RepoSettings['language'];

interface RepositorySettingsProps {
  repoId: number;
  initialSettings?: RepoSettings;
  onSave: (settings: Partial<RepoSettings>) => Promise<void>;
}

export function RepositorySettings({ repoId, initialSettings, onSave }: RepositorySettingsProps) {
  const [settings, setSettings] = useState<Partial<RepoSettings>>({
    is_enabled: initialSettings?.is_enabled ?? false,
    review_style: initialSettings?.review_style ?? 'friendly',
    language: initialSettings?.language ?? 'en',
    focus_areas: initialSettings?.focus_areas ?? [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...settings,
      repo_id: repoId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.is_enabled}
            onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span>Enable RAG PR Bot</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Review Style</label>
        <select
          value={settings.review_style}
          onChange={(e) => setSettings({ ...settings, review_style: e.target.value as ReviewStyle })}
          className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white"
        >
          <option value="strict">Strict</option>
          <option value="friendly">Friendly</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Language</label>
        <select
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value as Language })}
          className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white"
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Save Settings
      </button>
    </form>
  );
} 