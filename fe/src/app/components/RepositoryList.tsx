'use client';

import { useState } from 'react';
import { RepositorySettings } from './RepositorySettings';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchRepositories, saveRepository } from '@/services/repository';
import { Repository } from '@/types/repository';
import { User } from 'next-auth';

interface RepositoryListProps {
  initialRepos: Repository[];
  accessToken: string;
  me: User;
}

export function RepositoryList({ initialRepos, accessToken, me }: RepositoryListProps) {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [repos, setRepos] = useState<Repository[]>(initialRepos);
  // ログイン中のユーザを取得

  const handleCardClick = (repoId: string) => {
    setSelectedRepo(selectedRepo === repoId ? null : repoId);
  };
  
  const onSaveSettings = async (repo: Repository) => {
    // ログイン中のユーザをコラボレータに追加
    await saveRepository(accessToken, repo, me);
    const updatedRepos = await fetchRepositories(accessToken);
    setRepos(updatedRepos);
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
            <span className="text-sm text-blue-500 dark:text-blue-400 hover:underline cursor-pointer">
              {selectedRepo === repo.id ? "Hide settings" : "Show settings"}
            </span>
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
                  repo={repo}
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