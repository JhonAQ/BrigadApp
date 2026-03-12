'use client';

import { useState } from 'react';
import { MOCK_USERS, MOCK_STUDENTS, UserRole } from '@/lib/mock';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  BadgeCheck, 
  Download, 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'STUDENTS'>('USERS');

  const handleGenerateCredentials = () => {
    const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));
    toast.promise(promise, {
      loading: 'Generando Carnets PDF...',
      success: 'Carnets generados exitosamente',
      error: 'Error al generar carnets',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Settings className="w-6 h-6 text-slate-600" />
             Panel Administrativo
           </h1>
           <p className="text-slate-500 text-sm">Gestión de usuarios y estudiantes.</p>
        </div>
        
        <div className="flex gap-2">
           <Button variant={activeTab === 'USERS' ? 'primary' : 'secondary'} onClick={() => setActiveTab('USERS')}>
             Brigadieres
           </Button>
           <Button variant={activeTab === 'STUDENTS' ? 'primary' : 'secondary'} onClick={() => setActiveTab('STUDENTS')}>
             Alumnos
           </Button>
        </div>
      </div>

      {activeTab === 'USERS' && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 className="font-semibold text-slate-700">Usuarios del Sistema</h2>
               <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                 <UserPlus className="w-4 h-4 mr-2" />
                 Nuevo Usuario
               </Button>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Rol</th>
                        <th className="px-6 py-3 text-right">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {MOCK_USERS.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-3 font-medium text-slate-800">{user.name}</td>
                           <td className="px-6 py-3">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold
                                 ${user.role === 'PROFESSOR_ADMIN' ? 'bg-purple-100 text-purple-700' : 
                                   user.role === 'GENERAL_BRIGADIER' ? 'bg-indigo-100 text-indigo-700' :
                                   user.role === 'PSYCHOLOGIST' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}
                              `}>
                                 {user.role.replace('_', ' ')}
                              </span>
                           </td>
                           <td className="px-6 py-3 text-right">
                              <button className="text-slate-400 hover:text-red-500 transition-colors">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
               <Button onClick={handleGenerateCredentials} variant="secondary" className="border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                  <BadgeCheck className="w-4 h-4 mr-2" />
                  Generar Carnets (PDF)
               </Button>
            </div>
         </div>
      )}

      {activeTab === 'STUDENTS' && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <h2 className="font-semibold text-slate-700">Directorio de Alumnos</h2>
                  <div className="relative">
                     <Search className="absolute top-2 left-2 w-4 h-4 text-slate-400" />
                     <input className="pl-8 pr-4 py-1 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-300 outline-none" placeholder="Buscar..." />
                  </div>
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-400">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>= 3+ Incidencias (Alerta Roja)</span>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                        <th className="px-6 py-3">DNI</th>
                        <th className="px-6 py-3">Alumno</th>
                        <th className="px-6 py-3">Grado/Sección</th>
                        <th className="px-6 py-3">Incidencias</th>
                        <th className="px-6 py-3 text-right">Estado</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {MOCK_STUDENTS.map((student) => {
                        const isAlert = student.incidentsCount >= 3;
                        return (
                           <tr key={student.id} className={isAlert ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'}>
                              <td className="px-6 py-3 font-mono text-slate-500">{student.dni}</td>
                              <td className="px-6 py-3 font-medium text-slate-800">{student.firstName} {student.lastName}</td>
                              <td className="px-6 py-3 text-slate-600">{student.grade}° {student.section}</td>
                              <td className="px-6 py-3">
                                 <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isAlert ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {student.incidentsCount}
                                 </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                 {isAlert && (
                                    <div className="inline-flex items-center gap-1 text-rose-600 font-bold text-xs uppercase animate-pulse">
                                       <AlertTriangle className="w-4 h-4" />
                                       Intervención
                                    </div>
                                 )}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      )}
    </div>
  );
}
