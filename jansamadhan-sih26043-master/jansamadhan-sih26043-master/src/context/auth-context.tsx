"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SOLVER" | "CITIZEN" | "INDUSTRY" | string;
  organization?: string | null;
  designation?: string | null;
  district?: string | null;
  state?: string | null;
  karmaPoints?: number;
  avatar?: string | null;
  skills?: string[];
  badges?: Array<{ id: string; name: string; icon: string; date?: string }>;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  switchDemoRole: (role: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    refreshUser();
  }, [refreshUser]);

  const switchDemoRole = async (role: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        // Also trigger sound effect if available
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("jansahaya-role-switched", { detail: { role: data.user.role } }));
          window.dispatchEvent(new CustomEvent("jansamadhan-role-switched", { detail: { role: data.user.role } }));
        }
      } else {
        const err = await res.json();
        console.error("Role switch failed:", err);
      }
    } catch (err) {
      console.error("Role switch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        switchDemoRole,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
