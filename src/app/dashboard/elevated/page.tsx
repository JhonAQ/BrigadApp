"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowBigUpDash,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ElevatedIncidentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [elevatedIncidents, setElevatedIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const authorizedRoles = [
    "DOCENTE",
    "BRIGADIER_GENERAL_PRINCIPAL",
    "BRIGADIER_GENERAL_ALTERNO",
    "DEVELOPER",
    "PSYCHOLOGIST",
  ];

  useEffect(() => {
    if (user && !authorizedRoles.includes(user.role || "")) {
      router.push("/dashboard/incidents");
      toast.error("No tienes permisos para acceder a esta sección.");
    } else {
      fetchElevatedIncidents();
    }
  }, [user]);

  const fetchElevatedIncidents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("incidents")
      .select("*, students(*), reporter:users(name)")
      .eq("status", "ESCALADA")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error cargando incidencias: " + error.message);
    } else {
      setElevatedIncidents(data || []);
    }
    setIsLoading(false);
  };

  const handleApprove = async (incident: any) => {
    if (
      !confirm(
        "¿Confirmas el envío de este caso a Psicología? El psicólogo será notificado.",
      )
    )
      return;

    const { error } = await supabase
      .from("incidents")
      .update({
        status: "PENDIENTE", // Reset status so it's not ESCALADA anymore
        needs_psychology: true, // This puts it in the Psychology inbox
      })
      .eq("id", incident.id);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("Incidencia derivada a Psicología correctamente.");
      fetchElevatedIncidents();
    }
  };

  const handleReject = async (incident: any) => {
    const reason = prompt(
      "Ingrese el motivo del rechazo (opcional):",
      "No amerita intervención psicológica inmediata.",
    );
    if (reason === null) return; // Cancelled

    const { error } = await supabase
      .from("incidents")
      .update({
        status: "PENDIENTE", // Reset status to normal incident
        needs_psychology: false, // Ensure it stays out of Psychology inbox
        psych_notes: `[Rechazado Elevación]: ${reason}`, // Append note
      })
      .eq("id", incident.id);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.info(
        "Elevación rechazada. El caso permanece como incidencia común.",
      );
      fetchElevatedIncidents();
    }
  };

  if (!user || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <header className="border-b border-indigo-100 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowBigUpDash className="w-8 h-8 text-amber-500" />
          Solicitudes de Elevación
        </h1>
        <p className="text-slate-500 mt-1">
          Revisa las incidencias que los brigadieres sugieren derivar al área de
          Psicología.
        </p>
      </header>

      {elevatedIncidents.length === 0 ? (
        <div className="bg-slate-50 rounded-xl p-12 text-center border border-dashed border-slate-300">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-600">Todo al día</h3>
          <p className="text-slate-500">
            No hay solicitudes de elevación pendientes de revisión.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {elevatedIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xl text-slate-600">
                      {incident.students?.first_name?.[0]}
                      {incident.students?.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {incident.students?.first_name}{" "}
                        {incident.students?.last_name}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        {incident.students?.grade} -{" "}
                        {incident.students?.section}{" "}
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {incident.date} a las {incident.time}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      incident.type === "GRAVE"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {incident.type}
                  </div>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 mb-4">
                  <p className="text-sm text-slate-800 font-medium mb-1">
                    Descripción del Incidente:
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {incident.description}
                  </p>
                  <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Reportado por:{" "}
                    <span className="font-semibold">
                      {incident.reporter?.name || "Desconocido"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 border-t border-slate-100 pt-4 justify-end">
                  <button
                    onClick={() => handleReject(incident)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleApprove(incident)}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar Envío
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
