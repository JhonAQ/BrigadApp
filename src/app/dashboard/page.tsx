"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ClipboardList,
  UserCheck,
  CalendarDays,
  Brain,
  Clock,
  Users,
  ChevronRight,
  Activity,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    incidentsToday: 0,
    recentIncidents: [] as any[],
  });

  useEffect(() => {
    if (user?.role?.includes("BRIGADIER") || user?.role === "DOCENTE" || user?.role === "DEVELOPER") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    const today = new Date().toLocaleDateString("es-PE", {
      timeZone: "America/Lima",
    });

    const { data: recent } = await supabase
      .from("incidents")
      .select("*, students(*)")
      .order("created_at", { ascending: false })
      .limit(6);

    if (recent) {
      setStats({
        incidentsToday: recent.filter((r: any) => r.date === today).length,
        recentIncidents: recent,
      });
    }
  };

  if (!user) return null;

  const isPrivileged =
    user.role.includes("BRIGADIER") || user.role === "DOCENTE" || user.role === "DEVELOPER";

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* HEADER DE SOFTWARE EMPRESARIAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Panel de Control
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Resumen operativo y gestión de accesos (
            {user.role.replace(/_/g, " ")})
          </p>
        </div>

        {isPrivileged && (
          <div className="flex items-center gap-2">
            <Link href="/dashboard/incidents">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-2 h-9 px-4 rounded-md text-sm">
                <ShieldAlert className="w-4 h-4" />
                Nueva Incidencia
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* MÉTRICAS CLAVE (KPIs) */}
      {isPrivileged && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">
                Incidencias Detección Hoy
              </h3>
              <p className="text-3xl font-bold text-slate-900">
                {stats.incidentsToday}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <TrendingUp className="w-5 h-5 text-slate-700" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">
                Estado de Base de Datos
              </h3>
              <p className="text-xl font-bold text-emerald-600 flex items-center gap-2 mt-1.5">
                <CheckCircle2 className="w-5 h-5" /> En línea
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Activity className="w-5 h-5 text-slate-700" />
            </div>
          </div>
        </div>
      )}

      {/* DISEÑO EN COLUMNAS PROFESIONAL (Izquierda: Historial / Derecha: Navegación) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL IZQUIERDO: HISTORIAL (RECUPERADO Y MEJORADO) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-lg">
              <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Historial de Infracciones
              </h2>
              <Link
                href="/dashboard/incidents"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Revisar registro en tabla
              </Link>
            </div>

            <div className="flex flex-col flex-1">
              {stats.recentIncidents.length === 0 && isPrivileged ? (
                <div className="p-8 text-center text-slate-500 text-sm h-full flex items-center justify-center">
                  No hay registros de infracciones recientes en el sistema.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {stats.recentIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-1.5 h-10 rounded-full ${inc.type === "GRAVE" ? "bg-red-500" : inc.type === "MODERADA" ? "bg-amber-500" : "bg-emerald-500"}`}
                        />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {inc.students?.first_name} {inc.students?.last_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {inc.date} a las {inc.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                          inc.type === "GRAVE"
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : inc.type === "MODERADA"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                      >
                        {inc.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!isPrivileged && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Tu cuenta no tiene privilegios para examinar el historial
                  general.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: ACCESO A MÓDULOS DE APLICACIÓN */}
        <div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                Módulos de Sistema
              </h2>
            </div>

            <div className="p-3 flex flex-col gap-2">
              {(user.role.includes("BRIGADIER") ||
                user.role === "DOCENTE" ||
                user.role === "DEVELOPER" ||
                user.role === "PSYCHOLOGIST") && (
                <ModuleAction
                  title="Panel de Incidencias"
                  desc="Ingreso y búsqueda"
                  icon={ClipboardList}
                  href="/dashboard/incidents"
                />
              )}

              {(user.role === "BRIGADIER_GENERAL_PRINCIPAL" ||
                user.role === "BRIGADIER_GENERAL_ALTERNO" ||
                user.role === "DOCENTE" ||
                user.role === "DEVELOPER") && (
                <ModuleAction
                  title="Control de Asistencia"
                  desc="Escáner QR"
                  icon={UserCheck}
                  href="/dashboard/attendance"
                />
              )}

              {(user.role.includes("BRIGADIER") || user.role === "DOCENTE" || user.role === "DEVELOPER") && (
                <ModuleAction
                  title="Reporte de Asistencias"
                  desc="Registros diarios"
                  icon={CalendarDays}
                  href="/dashboard/attendance-report"
                />
              )}

              {(user.role === "PSYCHOLOGIST" || user.role === "DEVELOPER") && (
                <ModuleAction
                  title="Área de Psicología"
                  desc="Gestión clínica"
                  icon={Brain}
                  href="/dashboard/psychology"
                />
              )}

              {(user.role === "BRIGADIER_GENERAL_PRINCIPAL" ||
                user.role === "DOCENTE" || user.role === "DEVELOPER") && (
                <ModuleAction
                  title="Administrar Usuarios"
                  desc="Mantenimiento de BD"
                  icon={Users}
                  href="/dashboard/admin"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleAction({ title, desc, icon: Icon, href }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 group border border-transparent hover:border-slate-200 transition-all"
    >
      <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all text-slate-600">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-900 truncate">{title}</h4>
        <p className="text-xs text-slate-500 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
    </Link>
  );
}
