'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User as UserIcon } from 'lucide-react';
import { MOCK_USERS, UserRole } from '@/lib/mock';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('GENERAL_BRIGADIER');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API delay
    setTimeout(() => {
        login(selectedRole);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="bg-slate-900 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">BrigadApp</h1>
          <p className="text-slate-400 text-sm">Sistema de Gestión Escolar</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DNI del Usuario</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese su DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  // required // Not required for mock demo
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // required
              />
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                Seleccionar Rol (Solo Demo)
              </label>
              <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm mb-4"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              >
                {MOCK_USERS.map(u => (
                  <option key={u.id} value={u.role}>
                    {u.name} - {u.role.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Iniciar Sesión
            </Button>
            
            <p className="text-xs text-center text-slate-400 mt-4">
              BrigadApp v1.0 &copy; 2026
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
