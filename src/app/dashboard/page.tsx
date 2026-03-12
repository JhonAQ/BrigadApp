"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Bienvenido, {user.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Access Cards */}
        <Link
          href="/dashboard/incidents"
          className="block p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-lg mb-2 text-indigo-600">
            Reportar Incidencia
          </h3>
          <p className="text-slate-500 text-sm">
            Registrar un nuevo suceso en el cuaderno virtual.
          </p>
        </Link>

        {(user.role === "PROFESSOR_ADMIN" ||
          user.role === "GENERAL_BRIGADIER") && (
          <Link
            href="/dashboard/attendance"
            className="block p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2 text-emerald-600">
              Tomar Asistencia
            </h3>
            <p className="text-slate-500 text-sm">
              Escanear QRs de brigadieres (Solo en colegio).
            </p>
          </Link>
        )}

        {(user.role === "PSYCHOLOGIST" || user.role === "PROFESSOR_ADMIN") && (
          <Link
            href="/dashboard/psychology"
            className="block p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2 text-rose-600">
              Panel Psicológico
            </h3>
            <p className="text-slate-500 text-sm">
              Gestión de casos y seguimiento clínico.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
