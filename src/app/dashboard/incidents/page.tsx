"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ChevronRight,
  MapPin,
  Save,
  Search,
  ShieldAlert,
  AlertTriangle,
  FileWarning,
  Clock,
  Calendar,
  X,
  History,
  CheckCircle2,
} from "lucide-react";
import { MOCK_STUDENTS, Incident, getGrades, getSections } from "@/lib/mock";
import { toast } from "sonner";

export default function IncidentsPage() {
  const [activeTab, setActiveTab] = useState<"NEW" | "HISTORY">("NEW");
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Selection Filters
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [severity, setSeverity] = useState<Incident["type"] | null>(null);
  const [description, setDescription] = useState("");

  // Mock History
  const [history, setHistory] = useState<any[]>([]);

  const filteredStudents = MOCK_STUDENTS.filter((s) => {
    // If user typed something, search everywhere
    if (searchTerm.length > 0) {
      return (
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dni.includes(searchTerm)
      );
    }
    // Otherwise use filters
    if (selectedGrade && s.grade !== selectedGrade) return false;
    if (selectedSection && s.section !== selectedSection) return false;
    return true;
  });

  const availableGrades = getGrades();
  const availableSections = selectedGrade ? getSections(selectedGrade) : [];

  const handleNext = () => setStep(step + 1);

  const handleSubmit = () => {
    if (!selectedStudent || !severity || !description) return;

    const newIncident = {
      id: Math.random().toString(),
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      type: severity,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "PENDIENTE",
    };

    setHistory([newIncident, ...history]);
    toast.success("Incidencia registrada correctamente");

    // Reset form
    setStep(1);
    setSelectedStudent(null);
    setSeverity(null);
    setDescription("");
    setSearchTerm("");
    setSelectedGrade("");
    setSelectedSection("");
    setActiveTab("HISTORY");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-600" />
          Cuaderno Virtual
        </h1>
        <div className="bg-slate-100 p-1 rounded-lg flex">
          <button
            onClick={() => setActiveTab("NEW")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "NEW" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
          >
            Nueva
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "HISTORY" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
          >
            Historial
          </button>
        </div>
      </div>

      {activeTab === "HISTORY" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
          <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-700">Incidencias Recientes</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No has registrado incidencias hoy.</p>
              </div>
            ) : (
              history.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${inc.type === "GRAVE" ? "bg-red-500" : inc.type === "MODERADA" ? "bg-amber-500" : "bg-emerald-500"}`}
                    />
                    <div>
                      <p className="font-bold text-slate-800">
                        {inc.studentName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {inc.date} • {inc.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                    {inc.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "NEW" && (
        <>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= s ? "bg-indigo-600" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: SELECT STUDENT */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold mb-4 text-slate-800">
                1. Identificar Alumno
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                    Grado
                  </label>
                  <select
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                    value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setSelectedSection("");
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                    Sección
                  </label>
                  <select
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedGrade}
                  >
                    <option value="">Seleccionar</option>
                    {availableSections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm"
                  placeholder="O ingresar nombre directo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all border ${selectedStudent?.id === student.id ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"}`}
                    >
                      <div>
                        <p
                          className={`font-bold text-sm ${selectedStudent?.id === student.id ? "text-indigo-700" : "text-slate-700"}`}
                        >
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {student.grade}° {student.section} - {student.dni}
                        </p>
                      </div>
                      {selectedStudent?.id === student.id && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No se encontraron alumnos con los filtros actuales.
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!selectedStudent}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold mb-4 text-slate-800">
                2. Detalles del Evento
              </h2>

              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Nivel de Gravedad
              </label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  {
                    id: "LEVE",
                    label: "Leve",
                    color:
                      "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-200",
                    icon: ShieldAlert,
                  },
                  {
                    id: "MODERADA",
                    label: "Moderada",
                    color:
                      "bg-amber-50 text-amber-700 border-amber-200 ring-amber-200",
                    icon: AlertTriangle,
                  },
                  {
                    id: "GRAVE",
                    label: "Grave",
                    color:
                      "bg-rose-50 text-rose-700 border-rose-200 ring-rose-200",
                    icon: FileWarning,
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSeverity(opt.id as any)}
                    className={`
                            flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                            ${severity === opt.id ? `ring-2 ring-offset-1 ${opt.color}` : "border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100"}
                        `}
                  >
                    <opt.icon
                      className={`w-6 h-6 mb-1 ${severity === opt.id ? "scale-110" : ""}`}
                    />
                    <span className="font-bold text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Descripción
                </label>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none min-h-[120px] text-sm resize-none"
                  placeholder="Describa los hechos observados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!severity || !description}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold mb-4 text-slate-800">
                3. Confirmar Reporte
              </h2>

              <div className="bg-slate-50 rounded-xl p-5 space-y-4 mb-6 border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 font-bold text-indigo-600 border border-indigo-50">
                    {selectedStudent?.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">
                      Alumno
                    </p>
                    <p className="font-bold text-slate-800 text-lg">
                      {selectedStudent?.firstName} {selectedStudent?.lastName}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {selectedStudent?.grade}° {selectedStudent?.section}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200 w-full" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                      Gravedad
                    </p>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                        severity === "LEVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : severity === "MODERADA"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                      Hora
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                    Observación
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Editar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 w-40"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Registrar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
