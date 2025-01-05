import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
      cookieName: process.env.NODE_ENV === "production" 
        ? "__Secure-authjs.session-token"
        : "authjs.session-token"
    })
  
  // 認証が必要なパスのリスト
  const authRequiredPaths = ["/"];
  
  // 現在のパスが認証必要なパスかチェック
  const isAuthRequired = authRequiredPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname === path + "/"
  );
  
  // 認証が必要で、トークンがない場合はログインページへリダイレクト
  if (isAuthRequired && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // 既に認証済みでログインページにアクセスした場合はホームへリダイレクト
  if (token && request.nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 