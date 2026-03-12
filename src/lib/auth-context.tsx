"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { mockUsers, type User } from "./mock";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    try {
      const stored = localStorage.getItem("brigadapp_user");
      if (stored) {
        const parsedUser = JSON.parse(stored) as User;
        setUser(parsedUser);
      }
    } catch {
      localStorage.removeItem("brigadapp_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      // Simulate async auth
      await new Promise((r) => setTimeout(r, 500));
      // NOTE: This is a mock authentication for demo purposes only.
      // In production, passwords should be hashed and compared server-side.
      const found = mockUsers.find(
        (u) => u.email === email && u.password === password
      );
      if (found) {
        setUser(found);
        localStorage.setItem("brigadapp_user", JSON.stringify(found));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("brigadapp_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
