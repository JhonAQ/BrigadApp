"use client";

import { useState } from "react";
import { MOCK_INCIDENTS, MOCK_STUDENTS, Incident } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  MoreHorizontal,
  Search,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function PsychologyPage() {
  const [activeTab, setActiveTab] = useState<"PENDIENTE" | "ATENDIDA">(
    "PENDIENTE",
  );
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );
  const [notes, setNotes] = useState("");

  // Hydrate incidents with student names
  const incidents = MOCK_INCIDENTS.map((inc) => ({
    ...inc,
    student: MOCK_STUDENTS.find((s) => s.id === inc.studentId),
  })).filter((inc) => inc.status === activeTab);

  const handleOpenCase = (incident: Incident) => {
    setSelectedIncident(incident);
    setNotes(incident.psychNotes || "");
  };

  const handleSaveNotes = () => {
    if (!selectedIncident) return;

    // In real app, update backend here
    toast.success("Caso actualizado y notas guardadas");

    // Mock update local state (won't persist reload)
    // Close modal
    setSelectedIncident(null);
  };

  const handleMarkAsAttended = () => {
    // Mock logic
    toast.success("Caso marcado como ATENDIDO");
    setSelectedIncident(null);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-rose-500" />
          Panel de Psicología
        </h1>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("PENDIENTE")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "PENDIENTE" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
          >
            Pendientes
            <span className="ml-2 bg-rose-100 text-rose-600 text-xs px-1.5 py-0.5 rounded-full">
              {MOCK_INCIDENTS.filter((i) => i.status === "PENDIENTE").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ATENDIDA")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "ATENDIDA" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
          >
            Atendidos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* List Column */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar caso..."
                className="w-full pl-9 pr-4 py-2bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-200 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {incidents.map((incident) => (
              <button
                key={incident.id}
                onClick={() => handleOpenCase(incident)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${selectedIncident?.id === incident.id ? "bg-rose-50 border-rose-200 ring-1 ring-rose-200" : "bg-white border-slate-100 hover:border-rose-100"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                      ${incident.type === "LEVE" ? "bg-emerald-100 text-emerald-700" : incident.type === "MODERADA" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}
                    `}
                  >
                    {incident.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {incident.time}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 truncate">
                  {incident.student?.firstName} {incident.student?.lastName}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {incident.description}
                </p>
              </button>
            ))}
            {incidents.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No hay casos en esta bandeja</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          {selectedIncident ? (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">
                    {selectedIncident.student?.firstName}{" "}
                    {selectedIncident.student?.lastName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedIncident.student?.grade}°{" "}
                    {selectedIncident.student?.section} • DNI:{" "}
                    {selectedIncident.student?.dni}
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                  <h3 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Descripción del Reporte
                  </h3>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {selectedIncident.description}
                  </p>
                  <div className="mt-3 text-xs text-amber-700/60 font-medium">
                    Reportado por:{" "}
                    {
                      MOCK_USERS.find(
                        (u) => u.id === selectedIncident.reporterId,
                      )?.name
                    }{" "}
                    • {selectedIncident.date}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    Notas de Sesión / Intervención
                  </h3>
                  <textarea
                    className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-200 outline-none resize-none text-sm leading-relaxed"
                    placeholder="Escriba aquí los detalles de la intervención, acuerdos o observaciones confidenciales..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedIncident(null)}
                >
                  Cancelar
                </Button>
                {activeTab === "PENDIENTE" && (
                  <Button
                    variant="secondary"
                    onClick={handleMarkAsAttended}
                    className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 border"
                  >
                    Marcar como Atendido
                  </Button>
                )}
                <Button onClick={handleSaveNotes}>Guardar Cambios</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <User className="w-16 h-16 mb-4 opacity-20" />
              <p>Seleccione un caso para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
