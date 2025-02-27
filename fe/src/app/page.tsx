import { SignOutButton } from "@/app/components/SignOutButton";
import { fetchRepositories } from "@/services/repository";
import { fetchRemainingQuestions } from "@/services/questions";
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
    // 残り質問回数を取得
    const remainingQuestions = await fetchRemainingQuestions();
    
    console.log('👀repos', repos);
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">リポジトリ管理</h1>
            {me?.image && (
              <Image 
                src={me.image} 
                alt={me.name || 'ユーザーアバター'} 
                className="w-8 h-8 rounded-full"
                width={32}
                height={32}
              />
            )}
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              本日の残り質問回数: {remainingQuestions !== null ? remainingQuestions : '---'} 回
            </div>
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
          リポジトリの読み込みに失敗しました。後でもう一度お試しください。
        </div>
        <SignOutButton />
      </div>
    );
  }
}
