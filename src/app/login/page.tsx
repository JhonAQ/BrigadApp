'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User as UserIcon, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dni.trim().length === 0) {
      toast.error('Ingrese un Usuario, DNI o Correo válido');
      return;
    }
    
    setIsLoading(true);
    try {
       await login(dni, password);
       // Login success handles redirect in context
    } catch (error) {
       toast.error('Error al iniciar sesión');
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 p-4'>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/50'
      >
        <div className='bg-slate-900 p-10 text-center relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0' />
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='relative z-10 mx-auto w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30'
          >
            <ShieldCheck className='w-10 h-10 text-white' />
          </motion.div>
          
          <h1 className='relative z-10 text-3xl font-bold text-white mb-2 tracking-tight'>BrigadApp</h1>
          <p className='relative z-10 text-indigo-200 text-sm font-medium'>Control y Gestión Escolar</p>
        </div>

        <div className='p-8 pt-10'>
          <form onSubmit={handleLogin} className='space-y-5'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1'>Usuario</label>
              <div className='relative group'>
                <UserIcon className='absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors' />
                <input 
                  type='text' 
                  className='w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium'
                  placeholder='ID, Correo o DNI'
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1'>Contraseña</label>
              <div className='relative group'>
                <Lock className='absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors' />
                <input 
                  type='password' 
                  className='w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium'
                  placeholder=''
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
                type='submit' 
                className='w-full h-12 text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]' 
                size='lg'
                disabled={isLoading}
            >
              {isLoading ? (
                  <span className='flex items-center gap-2'>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Iniciando...
                  </span>
              ) : 'Ingresar al Sistema'}
            </Button>
            
            <div className='text-center pt-2'>
              <p className='text-xs text-slate-400'>
                Credenciales Demo:<br/>
                Admin: 00000001 / admin<br/>
                Brigadier: 10000001 / gen
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
