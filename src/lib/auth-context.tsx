"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, MOCK_USERS } from "./mock";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (dni: string, password?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("brigadapp_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from storage", e);
        localStorage.removeItem("brigadapp_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (dni: string, password?: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const foundUser = MOCK_USERS.find((u) => u.dni === dni);

      if (!foundUser) {
        toast.error("DNI no encontrado");
        setIsLoading(false);
        return;
      }

      // Simple password check (in a real app, this would be hashed)
      if (foundUser.password && foundUser.password !== password) {
        toast.error("Contraseña incorrecta");
        setIsLoading(false);
        return;
      }

      setUser(foundUser);
      localStorage.setItem("brigadapp_user", JSON.stringify(foundUser));
      toast.success(`Bienvenido, ${foundUser.name}`);
      router.push("/dashboard");
      setIsLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("brigadapp_user");
    router.push("/login");
    toast.info("Sesión cerrada");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
