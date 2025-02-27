import { NextResponse } from "next/server";
import { getRemainingQuestions } from "@/app/api/utils/cosmosdb";
import { headers } from "next/headers";
import { getGitHubUser } from "../../utils/repository";

export async function GET() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await getGitHubUser(token);
    const userId = user.id.toString();
    const remaining = await getRemainingQuestions(userId);
    
    return NextResponse.json({ remaining });
  } catch (error) {
    console.error("残り質問回数取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 