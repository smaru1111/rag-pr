import { fetchWithAuth } from "@/utils/api-client";
import type { RepoSettings } from "@/lib/cosmosdb";

export interface Repository {
  id: number;
  full_name: string;
  description: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getRepositories(accessToken: string): Promise<Repository[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/api/repos`, accessToken);
  return response.json();
}

export async function saveRepoSettings(repoId: number, settings: Partial<RepoSettings>): Promise<RepoSettings> {
  const response = await fetch(`${API_BASE_URL}/api/repos/${repoId}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to save settings');
  }

  return response.json();
} 