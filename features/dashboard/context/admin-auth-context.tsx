"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { AdminUser } from "../permissions";

type AdminAuthContextType = {
  loading: boolean;
  admin: AdminUser | null;
  handleAuthenticate: (admin: AdminUser) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const revision = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++revision.current;
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      if (revision.current !== current) return;
      if (response.status === 401 || response.status === 403) {
        setAdmin(null);
        return;
      }
      if (!response.ok) return;
      const { user } = await response.json() as { user: AdminUser };
      if (revision.current === current) setAdmin(user.is_dashboard_admin ? user : null);
    } catch {
      // A transient network interruption leaves the last confirmed identity on screen.
    } finally {
      if (revision.current === current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isAuthenticated = admin?.is_dashboard_admin === true;
  useEffect(() => {
    if (!isAuthenticated) return;
    const check = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", check);
    const timer = window.setInterval(check, 15_000);
    return () => {
      window.removeEventListener("focus", check);
      window.clearInterval(timer);
    };
  }, [isAuthenticated, refresh]);

  const handleAuthenticate = (authenticatedAdmin: AdminUser) => {
    revision.current++;
    setAdmin(authenticatedAdmin);
    setLoading(false);
  };

  const logout = useCallback(async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    revision.current++;
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated, loading, handleAuthenticate, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
};
