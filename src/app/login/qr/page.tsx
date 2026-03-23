"use client";

import { useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function QRLoginContent() {
  const { loginWithQR, isLoading, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Si escanean el QR y ya hay sesión
      router.push("/dashboard/incidents");
      return;
    }

    const t = searchParams.get("t");
    if (!t) {
      toast.error("Enlace de código QR inválido");
      router.push("/login");
      return;
    }

    if (isLoading) return;

    try {
      // Decodificar Base64
      const decoded = atob(t);
      const [dni, id] = decoded.split(":");

      if (dni && id) {
        loginWithQR(dni, id).catch(() => {
          router.push("/login");
        });
      } else {
        throw new Error("Mal formato");
      }
    } catch (e) {
      toast.error("Código QR corrupto o no autorizado");
      router.push("/login");
    }
  }, [isLoading, user, searchParams, router, loginWithQR]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center border border-slate-100">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Accediendo...
        </h2>
        <p className="text-slate-500 mt-2 text-sm font-medium">
          Validando sus credenciales de seguridad
        </p>
      </div>
    </div>
  );
}

export default function QRLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <QRLoginContent />
    </Suspense>
  );
}
