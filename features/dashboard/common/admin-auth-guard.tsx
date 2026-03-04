"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../context/admin-auth-context";

const AdminRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/admin-login");
    }
  }, [loading, isAuthenticated, router]);

  // While checking auth → show loader
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 bg-black text-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-blue-500 border-b-transparent animate-spin [animation-direction:reverse]" />
        </div>

        <p className="text-lg tracking-wide text-gray-300 animate-pulse">
          Checking authentication...
        </p>
      </div>
    );
  }

  // If not authenticated → render nothing while redirecting
  if (!isAuthenticated) return null;

  // Only authenticated users reach here
  return <>{children}</>;
};

export default AdminRouteGuard;
