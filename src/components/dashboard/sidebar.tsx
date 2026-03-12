"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/mock";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: "🏠",
    roles: ["teacher", "brigadier", "psychologist", "admin"],
  },
  {
    href: "/dashboard/attendance",
    label: "Asistencia",
    icon: "📋",
    roles: ["teacher", "admin"],
  },
  {
    href: "/dashboard/incidents",
    label: "Incidentes",
    icon: "⚠️",
    roles: ["teacher", "psychologist", "admin"],
  },
  {
    href: "/dashboard/psychology",
    label: "Psicología",
    icon: "🧠",
    roles: ["psychologist", "admin"],
  },
  {
    href: "/dashboard/reports",
    label: "Reportes",
    icon: "📊",
    roles: ["teacher", "psychologist", "admin"],
  },
  {
    href: "/dashboard/admin",
    label: "Administración",
    icon: "⚙️",
    roles: ["admin"],
  },
];

const roleLabels: Record<UserRole, string> = {
  teacher: "Profesor",
  brigadier: "Brigadier",
  psychologist: "Psicóloga/o",
  admin: "Administrador",
};

const roleBadgeColors: Record<UserRole, string> = {
  teacher: "bg-green-100 text-green-700",
  brigadier: "bg-blue-100 text-blue-700",
  psychologist: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
};

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
    onClose?.();
  }

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="flex h-full flex-col bg-white">
      {/* Brand */}
      <div className="border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg shadow-sm">
            🚦
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">BrigadApp</h1>
            <p className="text-xs text-gray-500">Brigadistas Escolares</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user.name}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColors[user.role]}`}
              >
                {roleLabels[user.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t px-4 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <span className="text-base">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
