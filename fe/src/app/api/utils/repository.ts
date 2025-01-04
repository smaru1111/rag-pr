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

export async function getPullRequestDiff(token: string, owner: string, repo: string, pullNumber: number) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3.diff',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch pull request diff');
  }

  return await response.text();
}

export async function createPullRequestComment(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create pull request comment');
  }

  return await response.json();
}

