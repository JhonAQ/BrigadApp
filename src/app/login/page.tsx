"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const demoCredentials = [
  { role: "Profesor", email: "profesor@brigadapp.com", password: "profesor123" },
  { role: "Brigadier", email: "brigadier@brigadapp.com", password: "brigadier123" },
  { role: "Psicóloga", email: "psicologa@brigadapp.com", password: "psico123" },
  { role: "Admin", email: "admin@brigadapp.com", password: "admin123" },
];

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const ok = await login(email, password);
    if (ok) {
      router.push("/dashboard");
    } else {
      setError("Correo o contraseña incorrectos. Por favor, intenta de nuevo.");
      setSubmitting(false);
    }
  }

  function fillDemo(creds: { email: string; password: string }) {
    setEmail(creds.email);
    setPassword(creds.password);
    setError("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
            <span className="text-3xl">🚦</span>
          </div>
          <h1 className="text-3xl font-bold text-white">BrigadApp</h1>
          <p className="mt-1 text-blue-200">Sistema de Gestión de Brigadistas Escolares</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@brigadapp.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={submitting}
              className="w-full justify-center py-3"
            >
              Ingresar
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 border-t pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              Acceso demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-left text-xs transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="font-medium text-blue-700">{cred.role}</span>
                  <br />
                  <span className="text-gray-500">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
