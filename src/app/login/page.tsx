"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        router.push("/dashboard");
      } else {
        setError("Correo o contraseña incorrectos. Verifica tus credenciales.");
      }
    } finally {
      setLoading(false);
    }
  }

  const demoAccounts = [
    { label: "Admin", email: "admin@brigadapp.edu", password: "admin123" },
    { label: "Coordinador", email: "coord@brigadapp.edu", password: "coord123" },
    { label: "Brigadista", email: "carlos@brigadapp.edu", password: "brig123" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Left panel – visible on desktop */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 p-12 text-white">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
          <Shield size={40} className="text-white" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">BrigadApp</h1>
        <p className="mb-10 text-center text-blue-200 text-lg leading-relaxed max-w-sm">
          Sistema integral de gestión de brigadas escolares. Controla
          asistencia, incidentes y credenciales desde un solo lugar.
        </p>
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          {[
            { icon: "✓", text: "Control de asistencia en tiempo real" },
            { icon: "✓", text: "Gestión de incidentes y reportes" },
            { icon: "✓", text: "Credenciales con código QR" },
            { icon: "✓", text: "Panel administrativo completo" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3"
            >
              <span className="text-blue-300 font-bold">{item.icon}</span>
              <span className="text-sm text-blue-100">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">BrigadApp</h1>
            <p className="text-sm text-slate-500 mt-1">
              Sistema de Brigadas Escolares
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg border border-slate-100">
            <h2 className="mb-1 text-2xl font-bold text-slate-900">
              Bienvenido
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Ingresa tus credenciales para continuar
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@brigadapp.edu"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Ingresando...
                  </span>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Cuentas de demostración
            </p>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setError("");
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-left hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {acc.label}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {acc.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
