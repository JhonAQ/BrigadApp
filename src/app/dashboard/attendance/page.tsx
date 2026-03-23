"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Camera,
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"scanner" | "config">("scanner");

  const canConfigure =
    user &&
    [
      "DEVELOPER",
      "BRIGADIER_GENERAL_PRINCIPAL",
      "DOCENTE",
      "COORDINADOR",
    ].includes(user.role);

  // Scanner State
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState(true);

  // Config State
  const [limitTime, setLimitTime] = useState("08:00");
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const isUuid = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      value,
    );

  const decodeQr = (qrData: string) => {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed && typeof parsed === "object") {
        const dniCandidate = parsed.dni || parsed.id;
        const uuidCandidate = parsed.id && isUuid(parsed.id) ? parsed.id : null;
        return { dni: dniCandidate, uuid: uuidCandidate };
      }
    } catch (err) {
      /* ignore parse errors */
    }

    const uuidCandidate = isUuid(qrData) ? qrData : null;
    return { dni: qrData, uuid: uuidCandidate };
  };

  // Load Settings
  const fetchSettings = async () => {
    const { data } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "attendance_limit_time")
      .single();
    if (data && data.value) setLimitTime(data.value);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // --------------- QR Scanner Engine ---------------
  const processQrCode = useCallback(
    async (qrData: string) => {
      if (!isScanning) return;
      setIsScanning(false);
      toast.loading("Verificando identidad...", { id: "verifyQr" });

      const decoded = decodeQr(qrData);

      // Buscar el usuario
      let user = null;
      let error = null as any;

      if (decoded.uuid) {
        const { data, error: err } = await supabase
          .from("users")
          .select("*")
          .eq("id", decoded.uuid)
          .single();
        user = data;
        error = err;
      }

      if ((!user || error) && decoded.dni) {
        const { data, error: err } = await supabase
          .from("users")
          .select("*")
          .eq("dni", decoded.dni)
          .single();
        user = data;
        error = err;
      }

      if (error || !user) {
        toast.dismiss("verifyQr");
        toast.error("QR no válido o usuario no encontrado.");
        setScannedUser(null);
        setTimeout(() => setIsScanning(true), 2000);
        return;
      }

      // Calcular puntualidad
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const isLate = currentTimeStr > limitTime;

      toast.dismiss("verifyQr");
      toast.success("¡Identidad verificada!");
      setScannedUser({ ...user, isLate, scannedAt: now });
    },
    [isScanning, limitTime],
  );

  const capture = useCallback(() => {
    if (webcamRef.current && isScanning) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height,
            );
            if (code && code.data) {
              processQrCode(code.data);
            }
          }
        };
      }
    }
  }, [webcamRef, isScanning, processQrCode]);

  useEffect(() => {
    let interval: any;
    if (isScanning && hasPermission && activeTab === "scanner") {
      interval = setInterval(() => {
        capture();
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isScanning, hasPermission, capture, activeTab]);

  const resetScan = () => {
    setScannedUser(null);
    setIsScanning(true);
  };

  const registerAttendance = async (uniformComplete: boolean) => {
    if (!scannedUser) return;
    const tId = toast.loading("Registrando asistencia...");

    const { error } = await supabase.from("attendance").insert({
      user_id: scannedUser.id,
      uniform_complete: uniformComplete,
      on_time: !scannedUser.isLate,
      date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      toast.error("Error al registrar", { id: tId });
    } else {
      toast.success("Asistencia registrada correctamente", { id: tId });
      resetScan();
    }
  };

  // --------------- Config Actions ---------------
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    const { error } = await supabase.from("settings").upsert(
      {
        key: "attendance_limit_time",
        value: limitTime,
      },
      { onConflict: "key" },
    );

    if (error) {
      toast.error("Error al guardar configuración");
    } else {
      toast.success("Configuración actualizada");
    }
    setIsSavingConfig(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Clock className="w-6 h-6 text-indigo-600" />
          Control de Asistencia
        </h1>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "scanner" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Camera className="w-4 h-4" /> Escáner
          </button>

          {canConfigure && (
            <button
              onClick={() => setActiveTab("config")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "config" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Settings className="w-4 h-4" /> Configuración
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
        {/* TAB: SCANNER */}
        {activeTab === "scanner" && (
          <div className="w-full h-full bg-black relative flex flex-col items-center justify-center">
            {!isScanning && scannedUser && (
              <div className="absolute top-4 right-4 z-40">
                <Button
                  onClick={resetScan}
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-slate-900 border-none shadow-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nueva Lectura
                </Button>
              </div>
            )}

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
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900 p-8 text-center">
                      <Camera className="w-16 h-16 mb-4 opacity-50" />
                      <p className="font-bold text-white mb-2">
                        Sin acceso a la cámara
                      </p>
                      <p className="text-sm">
                        Por favor permite el acceso a la cámara para escanear.
                      </p>
                      <Button
                        variant="ghost"
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
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-3xl bg-transparent box-content shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] overflow-hidden">
                        <motion.div
                          className="absolute top-0 left-0 w-full h-1 bg-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-20"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-white/20 rounded-3xl animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-8 left-0 right-0 text-center z-20 pointer-events-none">
                    <span className="bg-black/60 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest shadow-lg">
                      Enfoque el Código QR
                    </span>
                  </div>
                </motion.div>
              ) : scannedUser ? (
                /* Success View */
                <motion.div
                  key="result"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl m-4 text-center relative z-20"
                >
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg -mt-16 relative z-30">
                    <QrCode className="w-12 h-12 text-indigo-600" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    {scannedUser.name}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 mb-6 bg-indigo-50 inline-block px-3 py-1 rounded-full uppercase tracking-wide">
                    {scannedUser.role}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">
                        Hora Escaneada
                      </p>
                      <p className="font-bold text-slate-700 text-lg">
                        {new Date(
                          scannedUser.scannedAt || Date.now(),
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center ${scannedUser.isLate ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}
                    >
                      <p
                        className={`text-[10px] uppercase font-bold mb-1 tracking-wider ${scannedUser.isLate ? "text-red-400" : "text-emerald-500"}`}
                      >
                        Estado
                      </p>
                      <p
                        className={`font-bold text-lg ${scannedUser.isLate ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {scannedUser.isLate ? "Tardanza" : "Puntual"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase text-left pl-1 mb-2">
                      Evaluación de Uniforme
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => registerAttendance(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 py-6"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Completo
                      </Button>
                      <Button
                        onClick={() => registerAttendance(false)}
                        variant="danger"
                        className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 py-6"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Incompleto
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-data"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl m-4 text-center relative z-20"
                >
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg -mt-16">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    No se pudo leer el QR
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Acerca el carnet e intenta nuevamente.
                  </p>
                  <Button onClick={resetScan} variant="secondary">
                    Intentar otra vez
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB: CONFIGURACION */}
        {activeTab === "config" && canConfigure && (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                Reglas de Asistencia
              </h2>
              <p className="text-slate-500 mt-1">
                Configura el horario de tolerancia para marcar a un usuario como
                tardanza.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Hora Límite de Entrada
              </label>
              <div className="flex gap-4">
                <input
                  type="time"
                  value={limitTime}
                  onChange={(e) => setLimitTime(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 text-lg rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full max-w-[200px] p-3 shadow-sm"
                />
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="bg-indigo-600 hover:bg-indigo-700 h-auto py-3 px-6 rounded-xl shadow-md"
                >
                  {isSavingConfig ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex flex-col gap-1">
                <span>
                  • Los escaneos antes o exactamente a esta hora son{" "}
                  <b>Puntuales</b>.
                </span>
                <span>
                  • Los escaneos un minuto después serán marcados como{" "}
                  <b>Tardanza</b>.
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
