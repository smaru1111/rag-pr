import { auth } from "@/auth";
import { SignOutButton } from "@/app/components/SignOutButton";
import { LoginButton } from "@/app/components/LoginButton";
import { RepositoryList } from "@/app/components/RepositoryList";
import { getRepositories } from "@/services/repository";

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
    console.log(session);
    const repos = await getRepositories(session.accessToken!);

    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Repository Management</h1>
          <SignOutButton />
        </div>
        <RepositoryList repos={repos} />
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
