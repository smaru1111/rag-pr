'use client';

import { useState } from 'react';
import { RepositorySettings } from './RepositorySettings';
import type { RepoSettings } from '@/lib/cosmosdb';
import { Repository } from '@/services/repository';

interface RepositoryListProps {
  repos: Repository[];
  settings?: Record<number, RepoSettings>;
  onSaveSettings: (settings: RepoSettings) => Promise<void>;
}

export function RepositoryList({ repos, settings, onSaveSettings }: RepositoryListProps) {
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);

  console.log("settings", settings);
  console.log("repos", repos);
  return (
    <div className="grid gap-4">
      {repos.map((repo) => (
        <div
          key={repo.id}
          className="border p-4 rounded-lg hover:border-gray-400 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">{repo.full_name}</h2>
              <p className="text-gray-600">{repo.description}</p>
            </div>
            <button
              onClick={() => setSelectedRepo(selectedRepo === repo.id ? null : repo.id)}
              className="text-blue-500 hover:text-blue-600"
            >
              {selectedRepo === repo.id ? 'Hide Settings' : 'Show Settings'}
            </button>
          </div>

          {selectedRepo === repo.id && (
            <div className="mt-4 border-t pt-4">
              <RepositorySettings
                repoId={repo.id}
                initialSettings={settings?.[repo.id]}
                onSave={onSaveSettings}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}