import {  NextResponse } from "next/server";
import { auth } from "@/app/api/utils/auth";
import { getRemainingQuestions } from "@/app/api/utils/cosmosdb";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証されていません" }, { status: 401 });
    }
    
    const userId = session.user.id;
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