'use client';

import { signOut } from "next-auth/react";

export function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth" });
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-black text-white px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-800"
    >
      Sign out
    </button>
  );
} 