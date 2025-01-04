import { Repository } from "@/types/repository";
import { fetchWithAuth } from "@/utils/api-client";

export async function fetchRepositories(accessToken: string): Promise<Repository[]> {
  const response = await fetchWithAuth(`/api/repos`, accessToken, {
    method: 'GET',
  });
  return response.json();
}

export async function saveRepository(accessToken: string, repos: Repository): Promise<Repository> {
  // console.log('saving repos', repos);
  const response = await fetchWithAuth(`/api/repos`, accessToken, {
    method: 'POST',
    body: JSON.stringify(repos), 
  });

  return response.json();
} 