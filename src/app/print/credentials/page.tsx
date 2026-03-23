"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { Shield, School, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PrintPreview() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const [brigadiers, setBrigadiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idsParam) {
      const ids = idsParam.split(",");
      fetchBrigadiers(ids);
    } else {
      setLoading(false);
    }
  }, [idsParam]);

  const fetchBrigadiers = async (ids: string[]) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .in("id", ids);

    if (data) {
      setBrigadiers(data);
    }
    setLoading(false);
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold">Cargando credenciales...</div>
    );
  if (brigadiers.length === 0)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        No se encontraron brigadieres para generar. Regresa e intenta de nuevo.
      </div>
    );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#525659] pb-12 print:bg-white print:pb-0">
      {/* HERRAMIENTAS DE IMPRESIÓN (UI NO IMPRIMIBLE) */}
      <div className="bg-white p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between print:hidden sticky top-0 z-50 mb-8 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin"
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm font-bold bg-slate-100 px-3 py-2 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <h1 className="text-lg font-bold text-slate-800">
            Vista de Hoja de Impresión
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-md text-xs">
            <p className="font-bold mb-0.5">
              ⚠️ Configuración OBLIGATORIA al imprimir:
            </p>
            <ul className="list-disc pl-4 font-medium opacity-90">
              <li>
                Tamaño de papel: <span className="font-bold">A4</span>
              </li>
              <li>
                Márgenes:{" "}
                <span className="font-bold text-red-600">Ninguno (None)</span>
              </li>
              <li>
                Escala: <span className="font-bold">Personalizado (100%)</span>
              </li>
            </ul>
          </div>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Printer className="w-5 h-5" /> Imprimir ({brigadiers.length})
          </button>
        </div>
      </div>

      {/* HOJA A4 VIRTUAL */}
      <div
        className="bg-white mx-auto shadow-2xl print:shadow-none print:mx-0 relative"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "12mm",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
                    @media print {
                        @page { size: A4 portrait; margin: 0; }
                        body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        @page {
                            margin-top: 0mm;
                            margin-bottom: 0mm;
                        }
                    }
                `,
          }}
        />

        <div className="flex flex-wrap gap-[10mm] justify-center print:justify-start">
          {brigadiers.map((b) => {
            const nameParts = b.name.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || " ";

            const roleLabels: any = {
              BRIGADIER_AULA: "BRIGADIER DE AULA",
              BRIGADIER_PATRULLA: "BRIGADIER DE PATRULLA",
              BRIGADIER_GENERAL_PRINCIPAL: "BRIGADIER GENERAL",
              BRIGADIER_GENERAL_ALTERNO: "SUB BRIGADIER G.",
            };

            const qrPayloadFront = {
              id: b.dni || b.id.substring(0, 8),
              n: firstName,
              s: lastName,
              g: b.grade || "N",
              sc: b.section || "N",
              r: roleLabels[b.role] || b.role,
            };

            // Link que permite escanear a nivel global usando el URL base dinámico + Base64 encriptado
            const origin =
              typeof window !== "undefined" ? window.location.origin : "";
            const qrPayloadBack = `${origin}/login/qr?t=${btoa(`${b.dni}:${b.id}`)}`;

            return (
              <div
                key={b.id}
                className="flex gap-[10mm] print:break-inside-avoid"
              >
                {/* LADO FRENTE - ASISTENCIA */}
                <div
                  style={{
                    width: "54mm",
                    height: "86mm",
                    boxSizing: "border-box",
                  }}
                  className="bg-white border-[1px] border-slate-300 rounded-[10px] overflow-hidden flex flex-col relative shrink-0"
                >
                  <div className="bg-slate-900 text-white text-center py-2.5 px-2 flex flex-col items-center justify-center shrink-0 border-b-4 border-emerald-500">
                    <School className="w-5 h-5 mb-0.5 opacity-90" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest leading-tight">
                      BRIGADAPP
                    </h2>
                    <p className="text-[6px] text-slate-300 uppercase tracking-wider font-semibold">
                      Institución Educativa
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center pt-3 pb-2 px-3 relative">
                    <Shield className="w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 opacity-50 select-none z-0" />

                    <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider mb-2 relative z-10 text-center max-w-full truncate">
                      {roleLabels[b.role] || b.role.replace(/_/g, " ")}
                    </div>

                    <div className="bg-white p-0.5 rounded border border-slate-200 shadow-sm relative z-10 w-fit">
                      <QRCodeSVG
                        value={JSON.stringify(qrPayloadFront)}
                        size={80}
                        level="L"
                        includeMargin={false}
                      />
                    </div>

                    {/* NUEVO TÍTULO INDICATIVO DE FRENTE */}
                    <div className="bg-slate-800 text-white text-[6.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1.5 relative z-10 shadow-sm">
                      QR DE ASISTENCIA
                    </div>

                    <p className="text-[5.5px] text-slate-400 mt-0.5 font-mono tracking-widest relative z-10 w-full text-center truncate">
                      ID: {b.dni || b.id}
                    </p>

                    <div className="w-full mt-auto relative z-10 space-y-1 text-center pb-1">
                      <div>
                        <p
                          className="text-[11px] font-black text-slate-900 leading-none uppercase truncate"
                          title={b.name}
                        >
                          {b.name}
                        </p>
                      </div>
                      <div className="flex justify-between items-end border-t border-slate-200 pt-1.5 mt-1">
                        <div className="text-left w-1/2 pr-1 overflow-hidden">
                          <p className="text-[5.5px] text-slate-500 font-bold uppercase truncate">
                            Documento
                          </p>
                          <p
                            className="text-[7.5px] font-bold text-slate-800 font-mono tracking-wider truncate block w-full"
                            title={b.dni || b.id}
                          >
                            {b.dni || b.id}
                          </p>
                        </div>
                        <div className="text-right w-1/2 pl-1 overflow-hidden">
                          <p className="text-[5.5px] text-slate-500 font-bold uppercase truncate">
                            Grupo Asignado
                          </p>
                          <p className="text-[7.5px] font-bold text-slate-800 truncate block w-full">
                            {b.grade ? `${b.grade} ${b.section}` : "General"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-100 border-t border-slate-200 h-2 w-full shrink-0"></div>
                </div>

                {/* LADO POSTERIOR - INCIDENCIAS (ACCESS KEY) */}
                <div
                  style={{
                    width: "54mm",
                    height: "86mm",
                    boxSizing: "border-box",
                  }}
                  className="bg-white border-[1px] border-slate-300 rounded-[10px] overflow-hidden flex flex-col relative shrink-0"
                >
                  <div className="bg-indigo-600 text-white text-center py-2.5 px-2 flex flex-col items-center justify-center shrink-0 border-b-4 border-indigo-400">
                    <Shield className="w-5 h-5 mb-0.5 opacity-90" />
                    <h2 className="text-[9px] font-black uppercase tracking-widest leading-tight">
                      Control Rápido
                    </h2>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center pt-2 pb-2 px-3 relative">
                    <div className="text-center mb-3 relative z-10 w-full px-1">
                      <p className="text-[8.5px] font-black text-slate-900 uppercase">
                        CUADERNO DE
                      </p>
                      <p className="text-[12.5px] font-black text-indigo-600 uppercase mb-1 tracking-wide">
                        INCIDENCIAS
                      </p>
                      <p className="text-[6px] text-slate-500 uppercase font-bold leading-tight mx-auto px-1">
                        Escanea aquí para acceder e iniciar sesión directo.
                      </p>
                    </div>

                    <div className="bg-white p-1 rounded-xl border border-indigo-100 shadow-md relative z-10 mx-auto w-fit">
                      <QRCodeSVG
                        value={qrPayloadBack}
                        size={105}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    <div className="mt-4 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded text-center w-[95%] relative z-10">
                      <p className="text-[5.5px] text-indigo-600 font-bold uppercase tracking-wider mb-[1px]">
                        Llave de Acceso Única
                      </p>
                      <p className="text-[4.5px] text-indigo-400 font-mono tracking-widest">
                        NO COMPARTIR ESTE CÓDIGO
                      </p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border-t border-indigo-100 h-2 w-full shrink-0"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CredentialsPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center">Cargando módulo de impresión...</div>
      }
    >
      <PrintPreview />
    </Suspense>
  );
}
