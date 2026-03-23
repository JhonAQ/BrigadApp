"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.trim().length === 0) {
      toast.error("Por favor, ingrese un usuario válido");
      return;
    }
    if (password.length === 0) {
      toast.error("Por favor, ingrese su contraseña");
      return;
    }

    setIsLoading(true);
    try {
      await login(dni, password);
      // Login success handles redirect in context
    } catch (error) {
      toast.error("Credenciales incorrectas. Verifique sus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-2 bg-slate-50 relative overflow-hidden">
      {/* Mobile Background Decorations */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-br from-indigo-600 to-indigo-800 lg:hidden -z-0 rounded-b-[2.5rem]" />

      {/* Visual Side (Desktop) */}
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-slate-900 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-20 text-center px-12"
        >
          <div className="mb-8 transform scale-150 origin-center flex justify-center">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-2xl shadow-indigo-500/30">
              <ShieldCheck className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Brigad<span className="text-indigo-400">App</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">
            Sistema Integral de Gestión y Control Escolar para el seguimiento de
            incidencias, asistencia y bienestar estudiantil.
          </p>
        </motion.div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      </div>

      {/* Form Side */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 lg:p-24 bg-transparent lg:bg-white relative z-10 w-full">
        <div className="w-full max-w-md space-y-8 bg-white/95 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none p-8 lg:p-0 rounded-[2rem] shadow-2xl lg:shadow-none border border-white/20 lg:border-none mt-12 lg:mt-0 relative before:absolute before:inset-0 before:bg-white/40 before:rounded-[2rem] lg:before:hidden before:-z-10">
          <div className="text-center lg:text-left pt-2 pb-2">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 ring-4 ring-white absolute -top-8">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido
            </h2>
            <p className="mt-3 text-slate-500 text-sm font-medium">
              Ingrese sus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-7 mt-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">
                  Usuario o DNI
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-300 font-medium sm:text-sm shadow-sm"
                    placeholder="Ingrese su usuario"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Contraseña
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-300 font-medium sm:text-sm shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[15px] font-semibold rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2 group mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-[13px] text-slate-500 font-medium">
            ¿Problemas para acceder?{" "}
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors ml-1 hover:underline underline-offset-4"
              onClick={(e) => {
                e.preventDefault();
                toast.info(
                  "Por favor, contacte a su administrador o soporte para recuperar su acceso.",
                );
              }}
            >
              Contactar a soporte
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center lg:bottom-12 z-0 hidden lg:block">
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} BrigadApp v1.0. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
