import { UserRole } from "./types";

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  const formatted = formatDate(dateStr);
  return timeStr ? `${formatted} ${timeStr}` : formatted;
}

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Administrador",
    coordinator: "Coordinador",
    brigadier: "Brigadista",
  };
  return labels[role];
}

export function getRoleBadgeClass(role: UserRole): string {
  const classes: Record<UserRole, string> = {
    admin: "bg-purple-100 text-purple-800",
    coordinator: "bg-blue-100 text-blue-800",
    brigadier: "bg-green-100 text-green-800",
  };
  return classes[role];
}

export function getStatusLabel(
  status: string,
  type: "attendance" | "incident"
): string {
  if (type === "attendance") {
    const labels: Record<string, string> = {
      present: "Presente",
      absent: "Ausente",
      late: "Tardanza",
      excused: "Justificado",
    };
    return labels[status] ?? status;
  }
  const labels: Record<string, string> = {
    open: "Abierto",
    in_progress: "En progreso",
    resolved: "Resuelto",
    closed: "Cerrado",
  };
  return labels[status] ?? status;
}

export function getStatusColor(
  status: string,
  type: "attendance" | "incident"
): string {
  if (type === "attendance") {
    const colors: Record<string, string> = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      excused: "bg-blue-100 text-blue-800",
    };
    return colors[status] ?? "bg-gray-100 text-gray-800";
  }
  const colors: Record<string, string> = {
    open: "bg-red-100 text-red-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
}

export function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
  };
  return labels[severity] ?? severity;
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  return colors[severity] ?? "bg-gray-100 text-gray-800";
}

export function getIncidentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    behavioral: "Conductual",
    medical: "Médico",
    safety: "Seguridad",
    other: "Otro",
  };
  return labels[type] ?? type;
}

export function canAccess(role: UserRole, resource: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    admin: [
      "dashboard",
      "users",
      "attendance",
      "incidents",
      "credentials",
      "settings",
    ],
    coordinator: ["dashboard", "attendance", "incidents", "credentials"],
    brigadier: ["dashboard", "attendance"],
  };
  return permissions[role]?.includes(resource) ?? false;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
