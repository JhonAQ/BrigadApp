"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MOCK_ATTENDANCE, MOCK_INCIDENTS, MOCK_USERS } from "@/lib/mock-data";
import { getTodayISO, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  Users,
  CalendarCheck,
  UserX,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const today = getTodayISO();

  const stats = useMemo(() => {
    const brigadiers = MOCK_USERS.filter((u) => u.role === "brigadier" && u.active);
    const todayAttendance = MOCK_ATTENDANCE.filter((a) => a.date === today);
    const presentToday = todayAttendance.filter((a) => a.status === "present" || a.status === "late").length;
    const absentToday = todayAttendance.filter((a) => a.status === "absent").length;
    const openIncidents = MOCK_INCIDENTS.filter(
      (i) => i.status === "open" || i.status === "in_progress"
    ).length;
    const attendanceRate =
      brigadiers.length > 0
        ? Math.round((presentToday / brigadiers.length) * 100)
        : 0;

    return {
      totalStudents: brigadiers.length,
      presentToday,
      absentToday,
      openIncidents,
      attendanceRate,
      activeCredentials: brigadiers.filter((u) => u.studentCode).length,
    };
  }, [today]);

  const recentAttendance = useMemo(
    () =>
      MOCK_ATTENDANCE.filter((a) => a.date === today)
        .sort((a, b) => (b.time ?? "").localeCompare(a.time ?? ""))
        .slice(0, 5),
    [today]
  );

  const recentIncidents = useMemo(
    () =>
      [...MOCK_INCIDENTS]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 4),
    []
  );

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white">
        <h2 className="text-xl font-bold">
          Hola, {user?.name.split(" ")[0]}
        </h2>
        <p className="mt-1 text-blue-200 text-sm">
          {formatDate(today)} &mdash; Aquí tienes el resumen del día
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsCard
          title="Total Brigadistas"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
          subtitle="Activos en el sistema"
        />
        <StatsCard
          title="Presentes Hoy"
          value={stats.presentToday}
          icon={CalendarCheck}
          color="green"
          subtitle={`${stats.attendanceRate}% de asistencia`}
        />
        <StatsCard
          title="Ausentes Hoy"
          value={stats.absentToday}
          icon={UserX}
          color="red"
        />
        <StatsCard
          title="Incidentes Activos"
          value={stats.openIncidents}
          icon={AlertTriangle}
          color="yellow"
          subtitle="Requieren atención"
        />
        <StatsCard
          title="Tasa Asistencia"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          color="purple"
          subtitle="Hoy"
        />
        <StatsCard
          title="Credenciales"
          value={stats.activeCredentials}
          icon={CreditCard}
          color="blue"
          subtitle="Emitidas"
        />
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent attendance */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Asistencia de Hoy
            </h3>
            <Link
              href="/dashboard/attendance"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Ver todo
            </Link>
          </div>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No hay registros para hoy
            </p>
          ) : (
            <div className="space-y-2">
              {recentAttendance.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {rec.studentName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {rec.grade} {rec.section} · {rec.time}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      rec.status,
                      "attendance"
                    )}`}
                  >
                    {getStatusLabel(rec.status, "attendance")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent incidents */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-slate-400" />
              Incidentes Recientes
            </h3>
            <Link
              href="/dashboard/incidents"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Ver todo
            </Link>
          </div>
          {recentIncidents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              Sin incidentes
            </p>
          ) : (
            <div className="space-y-2">
              {recentIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-start justify-between rounded-xl bg-slate-50 px-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {inc.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(inc.date)} · {inc.location}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      inc.status,
                      "incident"
                    )}`}
                  >
                    {getStatusLabel(inc.status, "incident")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
