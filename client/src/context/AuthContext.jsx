import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiClient, setAccessToken, registerRefreshTokenHandler } from "../api/client";
import { toast } from "sonner";

const axiosInstanceRaw = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
});

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshTokens = useCallback(async () => {
    const storedRefresh = localStorage.getItem("satya_refresh_token");
    if (!storedRefresh) {
      setUser(null);
      setAccessToken(null);
      return null;
    }

    try {
      const response = await axiosInstanceRaw.post("/auth/refresh", {
        refreshToken: storedRefresh,
      });

      if (response.data && response.data.success) {
        const newAccess = response.data.data.accessToken;
        setAccessToken(newAccess);
        return newAccess;
      }
    } catch (_err) {
      localStorage.removeItem("satya_refresh_token");
      setAccessToken(null);
      setUser(null);
    }
    return null;
  }, []);

  const fetchCurrentUser = useCallback(async (token) => {
    try {
      const res = await apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (_err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    registerRefreshTokenHandler(refreshTokens);

    const initAuth = async () => {
      const storedRefresh = localStorage.getItem("satya_refresh_token");
      if (storedRefresh) {
        const access = await refreshTokens();
        if (access) {
          await fetchCurrentUser(access);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [refreshTokens, fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user: userData } = res.data;

      setAccessToken(accessToken);
      localStorage.setItem("satya_refresh_token", refreshToken);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    const storedRefresh = localStorage.getItem("satya_refresh_token");
    try {
      if (storedRefresh) {
        await apiClient.post("/auth/logout", { refreshToken: storedRefresh });
      }
    } catch (_err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("satya_refresh_token");
      setAccessToken(null);
      setUser(null);
      toast.info("Signed out successfully.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
}
