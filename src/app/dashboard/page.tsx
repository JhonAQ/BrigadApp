"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  mockBrigadiers,
  mockIncidents,
  mockAttendance,
  getAttendanceStats,
} from "@/lib/mock";

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${color}`}>
      <div className="mb-3 text-2xl">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-600">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = getAttendanceStats();
  const activeBrigadiers = mockBrigadiers.filter((b) => b.isActive).length;
  const openIncidents = mockIncidents.filter((i) => i.status === "open").length;
  const todayAttendance = mockAttendance.filter(
    (a) => a.date === "2026-03-10"
  ).length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 text-white shadow-sm">
        <h1 className="text-xl font-bold">
          {greeting()}, {user?.name?.split(" ")[0] ?? "Usuario"} 👋
        </h1>
        <p className="mt-1 text-blue-100 text-sm">
          Aquí tienes el resumen de hoy — {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon="👥"
          label="Brigadistas activos"
          value={activeBrigadiers}
          color="bg-blue-50"
        />
        <StatCard
          icon="✅"
          label="Presentes hoy"
          value={stats.present}
          color="bg-green-50"
        />
        <StatCard
          icon="❌"
          label="Ausentes hoy"
          value={stats.absent + stats.late}
          color="bg-red-50"
        />
        <StatCard
          icon="⚠️"
          label="Incidentes abiertos"
          value={openIncidents}
          color="bg-yellow-50"
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-800">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { href: "/dashboard/attendance", icon: "📋", label: "Tomar Asistencia" },
            { href: "/dashboard/incidents", icon: "⚠️", label: "Reportar Incidente" },
            { href: "/dashboard/reports", icon: "📊", label: "Ver Reportes" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent attendance summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Asistencia de hoy — 10 marzo 2026
        </h2>
        <div className="flex flex-wrap gap-3">
          {(
            [
              { label: "Presentes", count: stats.present, color: "bg-green-100 text-green-700" },
              { label: "Tardanzas", count: stats.late, color: "bg-yellow-100 text-yellow-700" },
              { label: "Ausentes", count: stats.absent, color: "bg-red-100 text-red-700" },
              { label: "Justificados", count: stats.justified, color: "bg-blue-100 text-blue-700" },
            ] as { label: string; count: number; color: string }[]
          ).map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${s.color}`}
            >
              <span className="text-lg font-bold">{s.count}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Asistencia total</span>
            <span>
              {Math.round((stats.present / stats.total) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{ width: `${(stats.present / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent incidents */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Incidentes recientes
          </h2>
          <Link
            href="/dashboard/incidents"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="space-y-3">
          {mockIncidents.slice(0, 3).map((incident) => {
            const brigadier = mockBrigadiers.find(
              (b) => b.id === incident.brigadierId
            );
            return (
              <div
                key={incident.id}
                className="flex items-start gap-3 rounded-xl border border-gray-100 p-3"
              >
                <span className="mt-0.5 text-lg">
                  {incident.severity === "high"
                    ? "🔴"
                    : incident.severity === "medium"
                    ? "🟡"
                    : "🟢"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {brigadier?.name ?? "Desconocido"}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {incident.description}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    incident.status === "open"
                      ? "bg-red-100 text-red-600"
                      : incident.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {incident.status === "open"
                    ? "Abierto"
                    : incident.status === "in_progress"
                    ? "En proceso"
                    : "Resuelto"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today attendance */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Registro de hoy ({todayAttendance} registros)
        </h2>
        <div className="space-y-2">
          {mockAttendance
            .filter((a) => a.date === "2026-03-10")
            .map((record) => {
              const brigadier = mockBrigadiers.find(
                (b) => b.id === record.brigadierId
              );
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                      {brigadier?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {brigadier?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Grado {brigadier?.grade}° {brigadier?.section}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.time && (
                      <span className="text-xs text-gray-400">{record.time}</span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        record.status === "present"
                          ? "bg-green-100 text-green-700"
                          : record.status === "late"
                          ? "bg-yellow-100 text-yellow-700"
                          : record.status === "justified"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.status === "present"
                        ? "Presente"
                        : record.status === "late"
                        ? "Tardanza"
                        : record.status === "justified"
                        ? "Justificado"
                        : "Ausente"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
