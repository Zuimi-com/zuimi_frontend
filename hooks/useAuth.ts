import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { generateToken } from "@/lib/api"; 


export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkToken() {
      const token = Cookies.get("access_token");

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

