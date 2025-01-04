import { Repository } from "@/types/repository";
export async function getGitHubUser(accessToken: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
}

export async function getGitHubRepository(accessToken: string): Promise<Repository[]> {
  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub repository");
  }
  
  const repos = await response.json() as {
    id: number;
    owner: { login: string };
    full_name: string;
    description: string | null;
  }[];
  
  const validRepos: Repository[] = repos.map((repo) => ({
    id: repo.id,
    owner_id: repo.owner.login,
    repo_id: repo.id,
    full_name: repo.full_name,
    description: repo.description,
    is_enabled: false,
    review_style: "strict",
    language: "en",
    focus_areas: [],
    created_at: new Date(),
    updated_at: new Date(),
  }));
  return validRepos;
}

