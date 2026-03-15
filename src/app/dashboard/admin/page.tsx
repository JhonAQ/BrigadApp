'use client';

import { useState } from 'react';
import { MOCK_USERS, MOCK_STUDENTS, UserRole } from '@/lib/mock';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
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
  const [userFilter, setUserFilter] = useState<'ALL' | 'BRIGADIER' | 'PSYCHOLOGIST'>('ALL');

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    
    // Mock PDF Generation
    doc.setFontSize(22);
    doc.text('Carnets Digitales - Brigadieres', 20, 20);
    
    let y = 40;
    MOCK_USERS.filter(u => u.role.includes('BRIGADIER')).forEach((user, i) => {
        doc.setFontSize(14);
        doc.text(`Nombre: ${user.name}`, 20, y);
        doc.setFontSize(10);
        doc.text(`Rol: ${user.role}`, 20, y + 6);
        doc.rect(15, y - 5, 180, 20);
        y += 25;
    });

    doc.save('carnets-brigadieres.pdf');
    toast.success('Descarga iniciada');
  };

  const filteredUsers = MOCK_USERS.filter(u => {
      if (userFilter === 'ALL') return true;
      if (userFilter === 'BRIGADIER') return u.role.includes('BRIGADIER');
      return u.role.includes('PSYCHOLOGIST');
  });

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
           <h1 className='text-2xl font-bold text-slate-800 flex items-center gap-2'>
             <Settings className='w-6 h-6 text-indigo-600' />
             Administración
           </h1>
           <p className='text-slate-500 text-sm'>Control total de usuarios y privilegios.</p>
        </div>
        
        <div className='flex bg-slate-100 p-1 rounded-xl shadow-inner'>
           <button 
             onClick={() => setActiveTab('USERS')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
           >
             Personal
           </button>
           <button 
             onClick={() => setActiveTab('STUDENTS')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'STUDENTS' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
           >
             Estudiantes
           </button>
        </div>
      </div>

      {activeTab === 'USERS' && (
         <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300'>
            <div className='p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50'>
               <div className='flex gap-2 overflow-x-auto pb-2 md:pb-0'>
                  {['ALL', 'BRIGADIER', 'PSYCHOLOGIST'].map((f) => (
                      <button 
                        key={f}
                        onClick={() => setUserFilter(f as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${userFilter === f ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {f === 'ALL' ? 'Todos' : f === 'BRIGADIER' ? 'Brigadieres' : 'Psicólogos'}
                      </button>
                  ))}
               </div>
               <div className='flex gap-2'>
                  <Button size='sm' className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'>
                    <UserPlus className='w-4 h-4 mr-2' />
                    Nuevo Usuario
                  </Button>
               </div>
            </div>
            
            <div className='overflow-x-auto'>
               <table className='w-full text-sm text-left'>
                  <thead className='text-xs text-slate-500 uppercase bg-slate-50/50'>
                     <tr>
                        <th className='px-6 py-3'>Nombre</th>
                        <th className='px-6 py-3'>Rol</th>
                        <th className='px-6 py-3'>Estado</th>
                        <th className='px-6 py-3 text-right'>Acciones</th>
                     </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                     {filteredUsers.map((user) => (
                        <tr key={user.id} className='hover:bg-slate-50 block sm:table-row'>
                           <td className='px-6 py-4 font-bold text-slate-700 block sm:table-cell'>
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                       {user.name.charAt(0)}
                                   </div>
                                   <div>
                                       {user.name}
                                       <div className="text-xs text-slate-400 font-normal sm:hidden">{user.role}</div>
                                   </div>
                               </div>
                           </td>
                           <td className='px-6 py-4 hidden sm:table-cell'>
                                <div className="flex gap-1 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        {user.role}
                                    </span>
                                </div>
                           </td>
                           <td className='px-6 py-4 block sm:table-cell'>
                               <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800'>
                                 Activo
                               </span>
                           </td>
                           <td className='px-6 py-4 text-right block sm:table-cell'>
                              <button className='text-slate-400 hover:text-red-600 transition-colors p-2'>
                                <Trash2 className='w-4 h-4' />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'STUDENTS' && (
          <div className='bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center'>
               <div className='max-w-md mx-auto'>
                   <BadgeCheck className='w-12 h-12 text-indigo-600 mx-auto mb-4' />
                   <h2 className='text-lg font-bold text-slate-800 mb-2'>Generación de Carnets</h2>
                   <p className='text-slate-500 mb-6'>Genera y descarga los carnets digitales para todos los brigadieres activos en formato PDF.</p>
                   
                   <Button onClick={handleDownloadPDF} className='bg-indigo-600 hover:bg-indigo-700 w-full shadow-lg shadow-indigo-500/20'>
                       <Download className='w-4 h-4 mr-2' />
                       Descargar Carnets (PDF)
                   </Button>
               </div>
          </div>
      )}
    </div>
  );
}