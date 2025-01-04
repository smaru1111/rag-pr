import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getGitHubUser, getGitHubRepository } from "@/lib/repository";
import { getRepositories, updateRepository } from "@/lib/cosmosdb";


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
    
    const mergedRepos = repos.map(repo => {
      const dbRepo = dbRepos.find(dbRepo => dbRepo.repo_id === repo.repo_id);
      return {
        ...repo,
        ...dbRepo,
      };
    });
    
    return NextResponse.json(mergedRepos);
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
  const savedRepos = await updateRepository(repos);
  return NextResponse.json(savedRepos);
}