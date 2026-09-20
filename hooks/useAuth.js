"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getToken } from "../services/session";

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      clearSession();
      router.replace("/login");
      return;
    }

    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  const logout = () => {
    clearSession();
    setIsAuthenticated(false);
    router.replace("/login");
  };

  return {
    isAuthenticated,
    loading,
    logout,
  };
}
