"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { canAccess, getInitials, getRoleLabel } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  AlertTriangle,
  CreditCard,
  Shield,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Resumen",
    icon: LayoutDashboard,
    resource: "dashboard",
    exact: true,
  },
  {
    href: "/dashboard/users",
    label: "Brigadistas",
    icon: Users,
    resource: "users",
  },
  {
    href: "/dashboard/attendance",
    label: "Asistencia",
    icon: CalendarCheck,
    resource: "attendance",
  },
  {
    href: "/dashboard/incidents",
    label: "Incidentes",
    icon: AlertTriangle,
    resource: "incidents",
  },
  {
    href: "/dashboard/credentials",
    label: "Credenciales",
    icon: CreditCard,
    resource: "credentials",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-100 shadow-lg transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                BrigadApp
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Brigadas Escolares</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.filter((item) => canAccess(user.role, item.resource)).map(
              (item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-700 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-white" : "text-slate-400"}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              }
            )}
          </ul>
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="text-xs text-slate-400">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
