'use client';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  ClipboardList, 
  History, 
  Home, 
  LogOut, 
  Menu, 
  PieChart, 
  ShieldCheck, 
  Users, 
  UserCheck2,
  BrainCircuit,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  const menuItems = [
    { 
      title: 'Inicio', 
      href: '/dashboard', 
      icon: Home,
      roles: ['PROFESSOR_ADMIN', 'GENERAL_BRIGADIER', 'SUB_BRIGADIER', 'PATROL_BRIGADIER', 'PSYCHOLOGIST']
    },
    { 
      title: 'Asistencia Scann', 
      href: '/dashboard/attendance', 
      icon: UserCheck2,
      roles: ['PROFESSOR_ADMIN', 'GENERAL_BRIGADIER', 'SUB_BRIGADIER', 'PATROL_BRIGADIER']
    },
    { 
      title: 'Incidencias', 
      href: '/dashboard/incidents', 
      icon: ClipboardList,
      roles: ['PROFESSOR_ADMIN', 'GENERAL_BRIGADIER', 'SUB_BRIGADIER', 'PATROL_BRIGADIER', 'PSYCHOLOGIST']
    },
    { 
      title: 'Psicología', 
      href: '/dashboard/psychology', 
      icon: BrainCircuit,
      roles: ['PROFESSOR_ADMIN', 'PSYCHOLOGIST'] // Admin can view but maybe limited interactions? Mock says "Exclusive panel" but usually Admin has oversight. Let's restrict to Psychologist for "operations" but give Admin view if asked. Prompt says: "Psicólogo(a): Acceso a un panel exclusivo... Restricción: No visualiza herramientas de administración". And for Admin: "Visualización del directorio de alumnos, todos los dashboards, reportes y alertas." Doesn't explicitly say Admin sees Psych panel but "todos los dashboards". Let's give access to Admin too.
    },
    { 
      title: 'Admin Usuarios', 
      href: '/dashboard/admin', 
      icon: Users,
      roles: ['PROFESSOR_ADMIN', 'GENERAL_BRIGADIER']
    },
    { 
      title: 'Reportes', 
      href: '/dashboard/reports', 
      icon: PieChart,
      roles: ['PROFESSOR_ADMIN', 'GENERAL_BRIGADIER']
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-50 p-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
           <ShieldCheck className="w-6 h-6 text-slate-900" />
           <span>BrigadApp</span>
        </div>
        <Button size="icon" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 transform lg:transform-none flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">BrigadApp</h1>
            <p className="text-xs text-slate-500">Panel de Control</p>
          </div>
        </div>

        <div className="p-4">
             <div className="bg-slate-800/50 rounded-lg p-3 mb-6 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Usuario</p>
                <p className="text-sm text-white font-medium truncate">{user.name}</p>
                <p className="text-xs text-indigo-400 mt-1 truncate">{user.role.replace('_', ' ')}</p>
             </div>

             <nav className="space-y-1">
               {filteredItems.map((item) => {
                 const isActive = pathname === item.href;
                 const Icon = item.icon;
                 return (
                   <Link 
                     key={item.href} 
                     href={item.href}
                     onClick={() => setIsOpen(false)}
                     className={cn(
                       "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                       isActive 
                         ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                         : "hover:bg-slate-800 hover:text-white"
                     )}
                   >
                     <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-200" : "text-slate-500")} />
                     <span className="truncate">{item.title}</span>
                   </Link>
                 )
               })}
             </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 w-full hover:transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="truncate">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
