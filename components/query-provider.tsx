"use client";

import { AdminAuthProvider } from "@/features/dashboard/context/admin-auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        {children}
        <Toaster position="top-right" />
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
