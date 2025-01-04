import { LoginButton } from "@/app/components/LoginButton";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-8">Welcome to RAG PR</h1>
        <LoginButton />
      </div>
    </div>
  );
} 