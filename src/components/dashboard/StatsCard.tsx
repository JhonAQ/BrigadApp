import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "yellow" | "purple";
  trend?: { value: number; label: string };
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-700 text-white",
    text: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-600 text-white",
    text: "text-green-700",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-600 text-white",
    text: "text-red-700",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "bg-yellow-500 text-white",
    text: "text-yellow-700",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-700 text-white",
    text: "text-purple-700",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`mt-2 text-xs font-medium ${
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${c.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
