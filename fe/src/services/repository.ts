import { Repository } from "@/types/repository";
import { fetchWithAuth } from "@/utils/api-client";
import { User } from "next-auth";

export async function fetchRepositories(accessToken: string): Promise<Repository[]> {
  const response = await fetchWithAuth(`/api/repos`, accessToken, {
    method: 'GET',
  });
  return response.json();
}

export async function saveRepository(accessToken: string, repos: Repository, me: User): Promise<Repository> {
  const response = await fetchWithAuth(`/api/repos`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify({repos,me}), 
  });

  return response.json();
} 