import { auth } from "@/auth";
import { SignOutButton } from "@/app/components/SignOutButton";
import { LoginButton } from "@/app/components/LoginButton";
import { getRepositories } from "@/services/repository";
import { getRepoSettingsByOwner } from "@/lib/cosmosdb";
import { RepositoryListContainer } from "@/app/components/RepositoryListContainer";
export default async function Home() {
  const session = await auth();
  
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <LoginButton />
      </div>
    );
  }

  try {
    const repos = await getRepositories(session.accessToken!);
    const settings = await getRepoSettingsByOwner(session.user?.id as string);
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.repo_id] = setting;
      return acc;
    }, {} as Record<number, typeof settings[0]>);

    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Repository Management</h1>
          <SignOutButton />
        </div>
        <RepositoryListContainer 
          repos={repos} 
          initialSettings={settingsMap}
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
