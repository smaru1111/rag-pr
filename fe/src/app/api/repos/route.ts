import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getGitHubUser, getGitHubRepository, getRepositoryCollaborators } from "@/app/api/utils/repository";
import { createRepository, getRepositories, updateRepository } from "@/app/api/utils/cosmosdb";


export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await getGitHubUser(token);
    const repos = await getGitHubRepository(token);
    const dbRepos = await getRepositories(repos.map(repo => repo.repo_id));
    
    const reposWithCollaborators = await Promise.all(
      repos.map(async (repo) => {
        const collaborators = await getRepositoryCollaborators(token, repo.owner_id, repo.name);
        return {
          ...repo,
          ...dbRepos.find(dbRepo => dbRepo.repo_id === repo.repo_id),
          collaborators
        };
      })
    );
    return NextResponse.json(reposWithCollaborators);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const authHeader = headersList.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const repos = await request.json();
  const savedRepos = await createRepository(repos);
  return NextResponse.json(savedRepos);
}
  
export async function PUT(request: NextRequest) {
  const headersList = await headers();
  const authHeader = headersList.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const repos = await request.json();
  const savedRepos = await updateRepository(repos);
  return NextResponse.json(savedRepos);
}