import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateRepoSettings, getRepoSettings } from "@/lib/cosmosdb";

async function getGitHubUser(accessToken: string) {
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getGitHubUser(session.accessToken);
    const settings = await getRepoSettings(user.id.toString(), parseInt(params.id));
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log("POST request params", id);
    
    const user = await getGitHubUser(session.accessToken);
    const settings = await request.json();
    const updated = await updateRepoSettings({
      ...settings,
      owner_id: user.id.toString(),
      repo_id: parseInt(id),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 