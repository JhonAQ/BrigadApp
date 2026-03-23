"use client";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  Building2,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  PieChart,
  ShieldCheck,
  Users,
  UserCheck2,
  BrainCircuit,
  GraduationCap,
  CalendarDays,
  ListTree,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfileDialog } from "./user-profile-dialog";

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  const menuItems = [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: Home,
      roles: ["BRIGADIER_GENERAL_PRINCIPAL", "DOCENTE", "PSYCHOLOGIST"],
    },
    {
      title: "Asistencia Scann",
      href: "/dashboard/attendance",
      icon: UserCheck2,
      roles: [
        "BRIGADIER_GENERAL_ALTERNO",
        "BRIGADIER_GENERAL_PRINCIPAL",
        "DOCENTE",
      ],
    },
    {
      title: "Incidencias",
      href: "/dashboard/incidents",
      icon: ClipboardList,
      roles: [
        "BRIGADIER_AULA",
        "BRIGADIER_PATRULLA",
        "BRIGADIER_GENERAL_ALTERNO",
        "BRIGADIER_GENERAL_PRINCIPAL",
        "DOCENTE",
        "PSYCHOLOGIST",
      ],
    },
    {
      title: "Elevaciones",
      href: "/dashboard/elevated",
      icon: ShieldCheck,
      roles: [
        "BRIGADIER_GENERAL_PRINCIPAL",
        "BRIGADIER_GENERAL_ALTERNO",
        "DOCENTE",
      ],
    },
    {
      title: "Psicología",
      href: "/dashboard/psychology",
      icon: BrainCircuit,
      roles: ["PSYCHOLOGIST"],
    },
    {
      title: "Estudiantes DB",
      href: "/dashboard/students",
      icon: GraduationCap,
      roles: ["BRIGADIER_GENERAL_PRINCIPAL", "DOCENTE"],
    },
    {
      title: "Reporte Asistencias",
      href: "/dashboard/attendance-report",
      icon: CalendarDays,
      roles: [
        "BRIGADIER_GENERAL_ALTERNO",
        "BRIGADIER_GENERAL_PRINCIPAL",
        "DOCENTE",
      ],
    },
    {
      title: "Grados y Secciones",
      href: "/dashboard/sections",
      icon: ListTree,
      roles: ["BRIGADIER_GENERAL_PRINCIPAL", "DOCENTE"],
    },
    {
      title: "Admin Usuarios",
      href: "/dashboard/admin",
      icon: Users,
      roles: ["BRIGADIER_GENERAL_PRINCIPAL", "DOCENTE"],
    },
    {
      title: "Reportes",
      href: "/dashboard/reports",
      icon: PieChart,
      roles: ["BRIGADIER_GENERAL_PRINCIPAL", "DOCENTE"],
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => item.roles.includes(role) || role === "DEVELOPER",
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-50 px-4 h-16 border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="w-6 h-6 text-slate-900" />
          <span className="text-slate-900">BrigadApp</span>
        </div>
        <Button size="icon" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="w-6 h-6 text-slate-700" />
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col h-full shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
              BrigadApp
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Gestión Escolar
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div
            onClick={() => setIsProfileOpen(true)}
            className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700/50 ring-1 ring-inset ring-white/5 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-indigo-400 font-medium uppercase tracking-wide truncate mt-0.5">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-3/4 rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-right">
              Sesión activa
            </p>
          </div>

          <nav className="space-y-1.5">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 translate-x-1"
                      : "hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-indigo-200"
                        : "text-slate-500 group-hover:text-slate-300",
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-600">Versión 1.0.0 (Beta)</p>
          </div>
        </div>
      </aside>
      <UserProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
