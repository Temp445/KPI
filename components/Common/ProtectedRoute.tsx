"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (roles && !roles.includes(role!)) {
        router.push("/unauthorized");
      }
    }
  }, [loading, user, role, router, roles]);

  if (loading || !user || (roles && !roles.includes(role!))) {
    return <div className="p-6">Loading...</div>; 
  }

  return <>{children}</>;
}
