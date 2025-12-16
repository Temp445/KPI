"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

export default function Navbar({ signedIn, signOut }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="w-full border-b bg-white dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            TL Dashboard
          </Link>

          <div className="hidden md:flex items-center gap-3">

            <Link
              href="/manage-pillars"
              className="text-sm font-semibold px-3 py-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Create Pillars
            </Link>

            <Link
              href="/manage-kpi"
              className="text-sm font-semibold px-3 py-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Create KPI
            </Link>

            <Link
              href="/manage-action-plan"
              className="text-sm font-semibold px-3 py-1.5 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Action Plans
            </Link>


            {signedIn ? (
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sign In
              </button>
            )}

            <div className="pl-2">
              <ThemeToggle />
              </div>       
               
          </div>

        <div className="md:hidden flex gap-4">
           <div className="mt-1">
             <ThemeToggle />

           </div>
            <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 space-y-3 border-t pt-4">

            <Link
              href="/manage-pillars"
              className="block px-4 py-2 text-sm font-semibold border rounded"
            >
              Create Pillars
            </Link>

            <Link
              href="/manage-kpi"
              className="block px-4 py-2 text-sm font-semibold border rounded"
            >
              Create KPI
            </Link>

            <Link
              href="/manage-action-plan"
              className="block px-4 py-2 text-sm font-semibold border rounded"
            >
              Action Plans
            </Link>

            {signedIn ? (
              <button
                onClick={signOut}
                className="w-full px-4 py-2 text-sm bg-red-500 text-white rounded"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
