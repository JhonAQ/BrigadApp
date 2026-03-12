'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, QrCode, Shirt, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendancePage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [showUniformModal, setShowUniformModal] = useState(false);

  // Mock scan function
  const handleMockScan = () => {
    // Simulate finding a random brigadier from mocks (in real app, this comes from QR payload)
    const randomId = Math.random() > 0.5 ? 'u3' : 'u4'; 
    const mockData = { id: randomId, name: randomId === 'u3' ? 'Sub-Brig. Marcos Díaz' : 'Brig. Aula Sofia Ruiz', dni: '87654321' };
    
    // Play success beep
    // const audio = new Audio('/beep.mp3'); audio.play().catch(() => {});
    
    setScannedUser(mockData);
    setIsScanning(false);
    setShowUniformModal(true);
    toast.success('QR Detectado');
  };

  const handleUniformCheck = (status: 'COMPLETA' | 'INCOMPLETA') => {
    // Save to backend logic here
    toast.success(`Asistencia registrada: ${status}`);
    
    // Reset state for next scan
    setShowUniformModal(false);
    setScannedUser(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Camera className="w-6 h-6" />
        Escáner de Asistencia
      </h1>

      {/* Main Scanner Area */}
      <div className="flex-1 bg-black rounded-3xl overflow-hidden relative flex flex-col items-center justify-center p-4 shadow-2xl">
        {isScanning ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 z-10 pointer-events-none" />
            
            {/* Camera Viewfinder Mock */}
            <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative z-20">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-xl" />
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-xl" />
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-xl" />
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-xl" />
               
               {/* Scanning Line Animation */}
               <motion.div 
                 className="absolute top-0 left-0 w-full h-1 bg-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
                 animate={{ top: ["5%", "95%", "5%"] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               />
            </div>

            <p className="text-white/70 mt-8 font-medium z-20 animate-pulse">Buscando código QR...</p>

            <Button 
                onClick={handleMockScan} 
                className="mt-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md z-30"
            >
                [MOCK] Simular Lectura QR
            </Button>
          </>
        ) : (
          <div className="text-white text-center">
             <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
             </div>
             <p className="text-lg font-bold">¡Lectura Exitosa!</p>
             <p className="text-sm opacity-80 mt-1">Procesando datos...</p>
          </div>
        )}
      </div>

      {/* Uniform Modal */}
      <AnimatePresence>
        {showUniformModal && scannedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shirt className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">{scannedUser.name}</h2>
                <p className="text-slate-500 text-sm">Validación de Indumentaria</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleUniformCheck('COMPLETA')}
                  className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-400 rounded-xl transition-all group"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-emerald-800">Completa</span>
                </button>

                <button
                  onClick={() => handleUniformCheck('INCOMPLETA')}
                  className="flex flex-col items-center justify-center p-4 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-400 rounded-xl transition-all group"
                >
                  <XCircle className="w-8 h-8 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-rose-800">Incompleta</span>
                </button>
              </div>

              <div className="mt-6 text-center">
                 <p className="text-xs text-slate-400">Esta acción no se puede deshacer inmediatamente.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
