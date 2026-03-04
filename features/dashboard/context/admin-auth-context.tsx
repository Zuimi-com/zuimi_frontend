"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type AdminAuthContextType = {
  loading: boolean;
  handleAuthenticate: (token: string) => void;
  isAuthenticated: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("access");
    console.log(token);
    
    if (token) {
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const handleAuthenticate = (token: string) => {
    if (token) {
      setIsAuthenticated(true);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, loading, handleAuthenticate }}
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
