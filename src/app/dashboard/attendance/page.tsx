"use client";

import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, QrCode, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_RESULTS = [
  {
    id: "u3",
    name: "Sub-Brig. Marcos Díaz",
    role: "Sub-Brigadier",
    status: "OK",
  },
  {
    id: "u4",
    name: "Brig. Aula Sofia Ruiz",
    role: "Brigadier de Aula",
    status: "OK",
  },
  { id: "err", name: "Desconocido", role: "Externo", status: "ERROR" },
];

export default function AttendancePage() {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState(true);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      // Simulating QR decoding delay
      toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
        loading: "Decodificando QR...",
        success: () => {
          const result =
            MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];

          if (result.status === "ERROR") {
            toast.error("QR no válido o no reconocido.");
            return "Error de lectura";
          } else {
            setScannedUser(result);
            setIsScanning(false);
            return "¡Identidad verificada!";
          }
        },
        error: "Error al escanear",
      });
    }
  }, [webcamRef]);

  const resetScan = () => {
    setScannedUser(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Camera className="w-6 h-6 text-indigo-600" />
          Escáner de Asistencia
        </h1>

        {!isScanning && (
          <Button
            onClick={resetScan}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nueva Lectura
          </Button>
        )}
      </div>

      <div className="flex-1 bg-black rounded-3xl overflow-hidden relative shadow-2xl flex flex-col items-center justify-center border-4 border-slate-900/10">
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              {hasPermission ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className="w-full h-full object-cover"
                  onUserMediaError={() => setHasPermission(false)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-slate-900 p-8 text-center">
                  <Camera className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-bold mb-2">Sin acceso a la cámara</p>
                  <p className="text-sm">
                    Por favor permite el acceso a la cámara para escanear.
                  </p>
                  <Button
                    variant="link"
                    className="text-indigo-400 mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Recargar página
                  </Button>
                </div>
              )}

              {/* Scanning Overlay UI */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 bg-black/40">
                  {/* Cutout */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-3xl bg-transparent box-content shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Animated Line */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-white/20 rounded-3xl animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
                <button
                  onClick={capture}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-4 border-white/60 w-20 h-20 rounded-full p-1 flex items-center justify-center transition-all active:scale-90 group shadow-lg"
                >
                  <div className="w-14 h-14 bg-white rounded-full group-hover:scale-90 transition-transform" />
                </button>
              </div>

              <div className="absolute top-8 left-0 right-0 text-center z-20 pointer-events-none">
                <span className="bg-black/60 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest shadow-lg">
                  Escanear QR Carnet
                </span>
              </div>
            </motion.div>
          ) : (
            /* Success / Result View */
            <motion.div
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl m-4 text-center relative z-20"
            >
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg -mt-20 relative z-30">
                <QrCode className="w-12 h-12 text-indigo-600" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-1">
                {scannedUser.name}
              </h3>
              <p className="text-xs font-bold text-indigo-600 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded-full uppercase tracking-wide border border-indigo-100">
                {scannedUser.role}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">
                    Hora
                  </p>
                  <p className="font-bold text-slate-700 text-lg">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">
                    Estado
                  </p>
                  <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold">
                    <span>Presente</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase text-left pl-1 mb-2">
                  Validación de Uniforme
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      toast.success("Asistencia registrada: Uniforme Completo");
                      resetScan();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completo
                  </Button>
                  <Button
                    onClick={() => {
                      toast.warning(
                        "Asistencia registrada: Uniforme Incompleto",
                      );
                      resetScan();
                    }}
                    variant="destructive"
                    className="shadow-lg shadow-red-500/20"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Incompleto
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
