import { SignOutButton } from "@/app/components/SignOutButton";
import { fetchRepositories } from "@/services/repository";
import { RepositoryList } from "./components/RepositoryList";
import { auth } from "@/auth";

// Server Component
export default async function Home() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("No access token");
    }

    const repos = await fetchRepositories(session.accessToken);
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Repository Management</h1>
          <SignOutButton />
        </div>
        <RepositoryList 
          initialRepos={repos} 
          accessToken={session.accessToken}
        />
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-4">
        <div className="text-center text-red-600">
          Failed to load repositories. Please try again later.
        </div>
        <SignOutButton />
      </div>
    );
  }
}
