"use client";

import { useAuth } from "@/contexts/auth-context";
import { getRoleLabel } from "@/lib/utils";
import { Menu, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <div>
              <p className="text-sm font-medium text-slate-900 text-right leading-none">
                {user.name.split(" ")[0]}
              </p>
              <p className="text-xs text-slate-400 text-right mt-0.5">
                {getRoleLabel(user.role)}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
