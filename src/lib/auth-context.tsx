"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  role: string;
  dni: string;
  password?: string;
  grade?: string;
  section?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (dni: string, password?: string) => Promise<void>;
  loginWithQR: (dni: string, id: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const login = async (dni: string, password?: string) => {
    setIsLoading(true);
    try {
      // Buscamos al usuario en la tabla validando el dni
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("dni", dni)
        .single();

      if (error || !data) {
        toast.error("DNI no encontrado");
        setIsLoading(false);
        return;
      }

      // Validamos la contraseña
      if (data.password && data.password !== password) {
        toast.error("Contraseña incorrecta");
        setIsLoading(false);
        return;
      }

      setUser(data);
      localStorage.setItem("brigadapp_user", JSON.stringify(data));
      toast.success(`Bienvenido, ${data.name}`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Error al conectar con la base de datos");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithQR = async (dni: string, id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("dni", dni)
        .eq("id", id) // Validamos ID único a forma de seguridad
        .single();

      if (error || !data) {
        toast.error("Datos del QR inválidos o no encontrados.");
        setIsLoading(false);
        return;
      }

      setUser(data);
      localStorage.setItem("brigadapp_user", JSON.stringify(data));
      toast.success(`Acceso Rápido concedido, ${data.name}`);
      // Lo mandamos derecho al dashboard de incidencias
      router.push("/dashboard/incidents");
    } catch (err: any) {
      toast.error("Error al procesar acceso rápido con QR");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("brigadapp_user");
    router.push("/login");
    toast.info("Sesión cerrada");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithQR, logout, isLoading }}
    >
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
