const fs = require("fs");

const content = `"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  BrainCircuit, 
  BarChart3, 
  LogOut,
  Settings,
  Shield,
  GraduationCap,
  ListTree
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navItems = [
    {
      title: 'Administración',
      href: '/dashboard/admin',
      icon: Settings,
      roles: ['PROFESSOR_ADMIN', 'DEVELOPER_ADMIN']
    },
    {
      title: 'Estudiantes',
      href: '/dashboard/students',
      icon: GraduationCap,
      roles: ['PROFESSOR_ADMIN', 'GENERAL_BRIGADIER', 'DEVELOPER_ADMIN']
    },
    {
      title: 'Grados y Secciones',
      href: '/dashboard/sections',
      icon: ListTree,
      roles: ['PROFESSOR_ADMIN', 'GENERAL_BRIGADIER', 'DEVELOPER_ADMIN']
    },
    {
      title: 'Asistencia',
      href: '/dashboard/attendance',
      icon: Calendar,
      roles: ['GENERAL_BRIGADIER', 'SECTION_BRIGADIER', 'PROFESSOR_ADMIN', 'DEVELOPER_ADMIN']
    },
    {
      title: 'Reporte de Asistencia',
      href: '/dashboard/attendance-report',
      icon: BarChart3,
      roles: ['GENERAL_BRIGADIER', 'PROFESSOR_ADMIN', 'DEVELOPER_ADMIN']
    },
    {
      title: 'Incidencias',
      href: '/dashboard/incidents',
      icon: AlertTriangle,
      roles: ['GENERAL_BRIGADIER', 'SECTION_BRIGADIER', 'PROFESSOR_ADMIN', 'DEVELOPER_ADMIN']
    },
    {
      title: 'Psicología',
      href: '/dashboard/psychology',
      icon: BrainCircuit,
      roles: ['PSYCHOLOGIST', 'PROFESSOR_ADMIN', 'DEVELOPER_ADMIN']
    }
  ];

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user.role as any)
  );

  return (
    <div className="flex flex-col w-64 bg-[#0B0F19] text-white border-r border-[#1F2937] shadow-xl fixed h-screen left-0 top-0">
      
      <div className="p-6 border-b border-[#1F2937] bg-[#111827]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-slate-100 leading-tight truncate">{user.name}</h2>
            <p className="text-xs text-indigo-400 font-medium truncate">
              {user.role.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: \`
          .flex-1.overflow-y-auto::-webkit-scrollbar { display: none; }
        \`}} />
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
          MENÚ PRINCIPAL
        </div>
        
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group \${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20' 
                  : 'text-slate-400 hover:bg-[#1F2937] hover:text-slate-200'
              }\`}
            >
              <Icon className={\`w-5 h-5 transition-colors \${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}\`} />
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#1F2937] bg-[#111827]">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full transition-colors group"
        >
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync("src/components/dashboard/sidebar.tsx", content);
