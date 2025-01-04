'use client';

import { useState } from 'react';
import { RepositorySettings } from './RepositorySettings';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RepoSettings } from '@/lib/cosmosdb';
import type { Repository } from '@/services/repository';

interface RepositoryListProps {
  repos: Repository[];
  settings?: Record<number, RepoSettings>;
  onSaveSettings: (settings: RepoSettings) => Promise<void>;
}

export function RepositoryList({ repos, settings, onSaveSettings }: RepositoryListProps) {
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);

  const handleCardClick = (repoId: number) => {
    setSelectedRepo(selectedRepo === repoId ? null : repoId);
  };

  return (
    <div className="grid gap-4">
      {repos.map((repo) => (
        <Card 
          key={repo.id}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => handleCardClick(repo.id)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">{repo.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{repo.description}</p>
            <div 
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                selectedRepo === repo.id 
                  ? 'max-h-[1000px] opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-4 pt-4 border-t">
                <RepositorySettings
                  repoId={repo.id}
                  initialSettings={settings?.[repo.id]}
                  onSave={onSaveSettings}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}