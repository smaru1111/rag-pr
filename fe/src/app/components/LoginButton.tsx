'use client';

import { signIn } from "next-auth/react";

export function LoginButton() {
  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <button
      onClick={handleSignIn}
      className="bg-black text-white px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-800"
    >
      Sign in with GitHub
    </button>
  );
}