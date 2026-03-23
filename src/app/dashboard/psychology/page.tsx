"use client";

import {
  AlertCircle,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  User,
  ExternalLink,
  ChevronLeft,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function PsychologyPage() {
  const { user } = useAuth();
  const isPsych = user?.role === "PSYCHOLOGIST" || user?.role === "DEVELOPER";
  const [activeTab, setActiveTab] = useState<"PENDIENTE" | "ATENDIDA">(
    "PENDIENTE",
  );
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [notes, setNotes] = useState("");
  // Auto-save logic
  const [debouncedNotes] = useDebounce(notes, 1000);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [incidents, setIncidents] = useState<any[]>([]);

  const fetchData = async () => {
    const { data } = await supabase
      .from("incidents")
      .select("*, students(*)")
      .eq("needs_psychology", true);
    if (data) setIncidents(data);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Auto-save effect
  useEffect(() => {
    if (!selectedIncident) return;
    
    // Don't save if notes haven't changed from original or it's the initial load
    if (debouncedNotes === selectedIncident.psych_notes) return;

    // Don't save if empty string (optional, depends on preference)
    // if (!debouncedNotes) return;

    const saveNotes = async () => {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from("incidents")
          .update({ psych_notes: debouncedNotes })
          .eq("id", selectedIncident.id);
        
        if (error) throw error;
        
        setLastSaved(new Date());
        // Update local state to avoid re-triggering if no further changes
        setSelectedIncident((prev: any) => ({ ...prev, psych_notes: debouncedNotes }));
        // Update list state silently 
        setIncidents((prev) => 
          prev.map((inc) => inc.id === selectedIncident.id ? { ...inc, psych_notes: debouncedNotes } : inc)
        );

      } catch (error) {
        toast.error("Error guardando notas automáticamente");
      } finally {
        setIsSaving(false);
      }
    };

    saveNotes();
  }, [debouncedNotes]);


  const handleOpenCase = (incident: any) => {
    setSelectedIncident(incident);
    setNotes(incident.psych_notes || "");
    setLastSaved(null);
  };

  const handleMarkAsAttended = async () => {
    if (!selectedIncident) return;
    
    if (!confirm("¿Confirmas que este caso ha sido atendido y finalizado? Desaparecerá de tu bandeja de pendientes.")) return;

    setIsSaving(true);
    try {
      // Save notes one last time just in case, and update status
      const { error } = await supabase
        .from("incidents")
        .update({ status: "ATENDIDA", psych_notes: notes })
        .eq("id", selectedIncident.id);
      if (error) throw error;
      
      toast.success("Caso marcado como ATENDIDO");
      setSelectedIncident(null);
      fetchData();
    } catch (error: any) {
      toast.error("Error actualizando estado: " + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-rose-500" />
          Panel de Psicología
        </h1>

        <div className="flex bg-slate-100 p-1 rounded-lg self-start md:self-auto w-full md:w-auto">
          <button
            onClick={() => setActiveTab("PENDIENTE")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "PENDIENTE" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
          >
            Pendientes
            <span className="ml-2 bg-rose-100 text-rose-600 text-xs px-1.5 py-0.5 rounded-full">
              {incidents.filter((i) => i.status === "PENDIENTE").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ATENDIDA")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "ATENDIDA" ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
          >
            Atendidos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 relative">
        {/* List Column - Show/Hide on mobile based on selection */}
        <div className={`lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col absolute inset-0 lg:relative z-10 lg:z-auto transition-transform duration-300 ${selectedIncident ? '-translate-x-full lg:translate-x-0 hidden lg:flex' : 'translate-x-0 flex'}`}>
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar caso..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {incidents
              .filter((i) => i.status === activeTab)
              .map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => handleOpenCase(incident)}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md active:scale-[0.98] ${selectedIncident?.id === incident.id ? "bg-rose-50 border-rose-200 ring-1 ring-rose-200" : "bg-white border-slate-100 hover:border-rose-100"}`}
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
                    {incident.students?.first_name}{" "}
                    {incident.students?.last_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {incident.description}
                  </p>
                </button>
              ))}
            {incidents.filter((i) => i.status === activeTab).length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No hay casos en esta bandeja</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Column - Show/Hide on mobile based on selection */}
        <div className={`lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col absolute inset-0 lg:relative z-20 lg:z-auto transition-transform duration-300 ${selectedIncident ? 'translate-x-0 flex' : 'translate-x-full lg:translate-x-0 hidden lg:flex'}`}>
          {selectedIncident ? (
            <>
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                <button 
                  onClick={() => setSelectedIncident(null)}
                  className="lg:hidden p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-0.5 truncate">
                    {selectedIncident.students?.first_name}{" "}
                    {selectedIncident.students?.last_name}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 flex items-center gap-2">
                    {selectedIncident.students?.grade}°{" "}
                    {selectedIncident.students?.section}
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline text-slate-400 text-xs">ID: {selectedIncident.id.substring(0,8)}</span>
                  </p>
                </div>
                <div className="hidden md:block">
                    {isSaving ? (
                        <span className="text-xs text-slate-400 flex items-center gap-2 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin"/> Guardando...
                        </span>
                    ) : lastSaved ? (
                         <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3"/> Guardado
                        </span>
                    ) : null}
                </div>
              </div>

              <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                  <h3 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Descripción del Reporte
                  </h3>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {selectedIncident.description}
                  </p>
                  <div className="mt-3 text-xs text-amber-700/60 font-medium pt-2 border-t border-amber-100/50 flex justify-between">
                    <span>Reportado por: Oficial</span>
                    <span>{selectedIncident.date}</span>
                  </div>
                </div>

                <div className="space-y-3 h-full pb-20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-rose-500" />
                        Notas de Sesión / Intervención
                    </h3>
                    <div className="md:hidden">
                        {isSaving ? (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin"/> Guardando
                            </span>
                        ) : lastSaved ? (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3"/> Guardado
                            </span>
                        ) : null}
                    </div>
                  </div>
                  
                  <textarea
                    className="w-full h-[calc(100%-40px)] min-h-75 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-100 focus:border-rose-400 outline-none resize-none text-sm leading-relaxed shadow-sm transition-all"
                    placeholder="Escriba aquí los detalles de la intervención, acuerdos o observaciones confidenciales. Se guardará automáticamente..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-white flex flex-col-reverse md:flex-row justify-end gap-3 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {activeTab === "PENDIENTE" && (
                  <Button
                    variant="primary"
                    onClick={handleMarkAsAttended}
                    className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 shadow-lg"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <CheckCircle2 className="w-4 h-4 mr-2"/>}
                    Finalizar y Marcar Atendido
                  </Button>
                )}
                 {/* Explicit save button for reassurance, though auto-save works */}
                 <Button 
                    variant="ghost" 
                    onClick={() => {
                        // Force save immediately
                        const saveNow = async () => {
                             setIsSaving(true);
                             await supabase.from("incidents").update({ psych_notes: notes }).eq("id", selectedIncident.id);
                             setLastSaved(new Date());
                             setIsSaving(false);
                             toast.success("Guardado manualexitoso");
                        };
                        saveNow();
                    }}
                    disabled={isSaving}
                    className="w-full md:w-auto text-slate-400 hover:text-slate-600"
                >
                    <Save className="w-4 h-4 mr-2"/>
                    Guardar
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                 <User className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-1">Ningún caso seleccionado</h3>
              <p className="max-w-xs mx-auto">Seleccione un estudiante de la lista para ver los detalles y redactar notas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
