"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(!!user);
  }, [user]);

  return (
    <nav className="w-full p-4 bg-gray-100 flex justify-between items-center">
      <Link href="/" className="font-semibold text-xl">
        TL Dashboard
      </Link>

      <div className="gap-5 flex">
        {role === "admin" && (
          <Link
            href="/dashboard"
            className="font-semibold text-sm border p-1.5 rounded"
          >
            Add Category
          </Link>
        )}

        {signedIn ? (
          <button
            onClick={signOut}
            className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};
