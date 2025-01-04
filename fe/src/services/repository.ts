import { fetchWithAuth } from "@/utils/api-client";

export interface Repository {
  id: number;
  full_name: string;
  description: string | null;
}

export async function getRepositories(accessToken: string): Promise<Repository[]> {
  const response = await fetchWithAuth("/api/repos", accessToken);
  return response.json();
} 