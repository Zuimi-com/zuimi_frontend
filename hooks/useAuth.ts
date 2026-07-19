import { useEffect, useState } from "react";
import { generateToken } from "@/lib/api"; 
import { getAccessToken } from "@/lib/auth-cookies";


export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkToken() {
      const token = getAccessToken();

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Optionally refresh token
        await generateToken(); 
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkToken();
  }, []);

    return { isAuthenticated, loading };
}  
