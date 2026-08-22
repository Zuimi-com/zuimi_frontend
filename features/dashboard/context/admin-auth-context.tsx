"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type AdminUser = {
  id: string;
  email: string;
  is_staff: true;
  is_superuser: boolean;
};

type AdminAuthContextType = {
  loading: boolean;
  admin: AdminUser | null;
  handleAuthenticate: (admin: AdminUser) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Admin session is not valid");
        return response.json() as Promise<{ user: AdminUser }>;
      })
      .then(({ user }) => {
        setAdmin(user);
        setIsAuthenticated(user.is_staff === true);
      })
      .catch(() => {
        setAdmin(null);
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAuthenticate = (authenticatedAdmin: AdminUser) => {
    setAdmin(authenticatedAdmin);
    setIsAuthenticated(authenticatedAdmin.is_staff === true);
  };

  const logout = useCallback(async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ admin, isAuthenticated, loading, handleAuthenticate, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};
