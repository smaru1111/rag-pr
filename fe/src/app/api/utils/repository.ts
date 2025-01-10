import { Collaborator, Repository } from "@/types/repository";
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
    name: string;
    description: string | null;
  }[];
  
  const validRepos: Repository[] = repos.map((repo) => ({
    id: repo.id.toString(),
    owner_id: repo.owner.login,
    repo_id: repo.id,
    full_name: repo.full_name,
    name: repo.name,
    description: repo.description,
    is_enabled: false,
    review_style: "strict",
    language: "en",
    focus_areas: [],
    collaborators: [],
    registered_collaborators: [],
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

export async function getRepositoryCollaborators(token: string, owner: string, repo: string): Promise<Collaborator[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/collaborators`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch collaborators');
  }

  const collaborators = await response.json();
  return collaborators.map((collaborator: Collaborator) => ({
    id: collaborator.id.toString(),
    login: collaborator.login,
    avatar_url: collaborator.avatar_url,
    role_name: collaborator.role_name,
    permissions: collaborator.permissions
  }));
}

