'use client';

import { useState } from 'react';
import { RepositoryList } from './RepositoryList';
import { saveRepoSettings } from '@/services/repository';
import type { Repository } from '@/services/repository';
import type { RepoSettings } from '@/lib/cosmosdb';

interface RepositoryListContainerProps {
  repos: Repository[];
  initialSettings: Record<number, RepoSettings>;
}

export function RepositoryListContainer({ repos, initialSettings }: RepositoryListContainerProps) {
  const [settings, setSettings] = useState(initialSettings);

  const handleSaveSettings = async (newSettings: RepoSettings) => {
    try {
      const savedSettings = await saveRepoSettings(newSettings.repo_id!, newSettings);
      setSettings(prev => ({
        ...prev,
        [savedSettings.repo_id]: savedSettings,
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return (
    <RepositoryList
      repos={repos}
      settings={settings}
      onSaveSettings={handleSaveSettings}
    />
  );
} 