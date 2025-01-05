import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";
import { Account, Session } from "next-auth";

// セッションに accessToken を追加するための型拡張
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

// トークンに accessToken を追加するための型拡張
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user repo'
        }
      }
    }),
  ],
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect() {
      // プロキシの影響を排除するためにbaseUrlを修正
      if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000";
      }
      return "https://ragprwebapps-asfeagcmfydzecb4.japaneast-01.azurewebsites.net";
    },
  },
}); 