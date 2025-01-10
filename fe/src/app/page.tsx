import { SignOutButton } from "@/app/components/SignOutButton";
import { fetchRepositories } from "@/services/repository";
import { RepositoryList } from "./components/RepositoryList";
import { auth } from "@/app/api/utils/auth";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      throw new Error("No access token");
    }
    if (!session.user) {
      throw new Error("No user");
    }
    // NextAuthのセッションからユーザー情報を取得
    const me = session.user;
    
    console.log('👀me', me);

    const repos = await fetchRepositories(session.accessToken);
    console.log('👀repos', repos);
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Repository Management</h1>
            {me?.image && (
              <Image 
                src={me.image} 
                alt={me.name || 'User avatar'} 
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
            )}
          </div>
          <SignOutButton />
        </div>
        <RepositoryList 
          initialRepos={repos} 
          accessToken={session.accessToken}
          me={me}
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
