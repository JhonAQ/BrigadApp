"use client";
import { supabase } from "@/lib/supabase";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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

const HISTORY_ALLOWED_ROLES = [
  "COORDINADOR",
  "BRIGADIER_GENERAL_PRINCIPAL",
  "BRIGADIER_GENERAL_ALTERNO",
  "DOCENTE",
  "DEVELOPER",
];

export default function IncidentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"NEW" | "HISTORY">("NEW");
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // History Filters
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyTimeRange, setHistoryTimeRange] = useState<
    "ALL" | "TODAY" | "WEEK" | "MONTH" | "CUSTOM"
  >("ALL");
  const [historyCustomDate, setHistoryCustomDate] = useState("");
  const [historyStatus, setHistoryStatus] = useState("ALL");
  const [historyType, setHistoryType] = useState("ALL");
  const [historyGrade, setHistoryGrade] = useState("ALL");
  const [historyOrigin, setHistoryOrigin] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Selection Filters
  const [selectedGrade, setSelectedGrade] = useState("");
  // Supabase states
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [dbIncidents, setDbIncidents] = useState<any[]>([]);
  const [dbSections, setDbSections] = useState<any[]>([]);
  const [needsPsychology, setNeedsPsychology] = useState(false);

  const canViewHistory = HISTORY_ALLOWED_ROLES.includes(user?.role || "");

  useEffect(() => {
    async function load() {
      const [{ data: st }, { data: inc }, { data: sec }] = await Promise.all([
        supabase.from("students").select("*"),
        supabase
          .from("incidents")
          .select("*, students(*), reporter:users!incidents_reporter_id_fkey(*)"),
        supabase.from("sections").select("*"),
      ]);
      if (st) setDbStudents(st);
      if (inc) setDbIncidents(inc);
      if (sec) setDbSections(sec);
    }
    load();
  }, []);

  const [selectedSection, setSelectedSection] = useState("");

  // Manual entry state
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [severity, setSeverity] = useState<Incident["type"] | null>(null);
  const [description, setDescription] = useState("");

  const filteredStudents = dbStudents.filter((s) => {
    // If user typed something, search everywhere
    if (searchTerm.length > 0) {
      return (
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Otherwise use filters
    if (selectedGrade && s.grade !== selectedGrade) return false;
    if (selectedSection && s.section !== selectedSection) return false;
    return true;
  });

  const filteredHistory = dbIncidents
    .filter((inc) => {
      const studentName =
        `${inc.students?.first_name} ${inc.students?.last_name}`.toLowerCase();
      const matchesSearch = studentName.includes(
        historySearchTerm.toLowerCase(),
      );

      // Date Filtering Logic
      let matchesDate = true;
      const incidentDate = new Date(`${inc.date}T12:00:00`); // Normalize time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (historyTimeRange === "TODAY") {
        matchesDate = inc.date === new Date().toISOString().split("T")[0];
      } else if (historyTimeRange === "WEEK") {
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        matchesDate = incidentDate >= firstDayOfWeek;
      } else if (historyTimeRange === "MONTH") {
        matchesDate =
          incidentDate.getMonth() === today.getMonth() &&
          incidentDate.getFullYear() === today.getFullYear();
      } else if (historyTimeRange === "CUSTOM" && historyCustomDate) {
        matchesDate = inc.date === historyCustomDate;
      }

      const matchesStatus =
        historyStatus === "ALL" ? true : inc.status === historyStatus;
      const matchesType =
        historyType === "ALL" ? true : inc.type === historyType;
      const matchesGrade =
        historyGrade === "ALL" ? true : inc.students?.grade === historyGrade;
      const matchesOrigin =
        historyOrigin === "ALL"
          ? true
          : historyOrigin === "PATRULLA"
            ? inc.reporter?.role === "BRIGADIER_PATRULLA"
            : historyOrigin === "AULA"
              ? inc.reporter?.role === "BRIGADIER_AULA"
              : true;

      return (
        matchesSearch &&
        matchesDate &&
        matchesStatus &&
        matchesType &&
        matchesGrade &&
        matchesOrigin
      );
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  const availableGrades = Array.from(
    new Set(dbSections.map((s: any) => s.grade)),
  ).sort();
  const availableSections = dbSections
    .filter((s: any) => s.grade === selectedGrade)
    .map((s: any) => s.name)
    .sort();

  const handleNext = () => setStep(step + 1);

  const handleManualSubmit = async () => {
    if (
      !manualData.firstName ||
      !manualData.lastName ||
      !selectedGrade ||
      !selectedSection
    ) {
      toast.error("Por favor complete nombres, apellidos, grado y sección");
      return;
    }

    const fName = manualData.firstName.trim().toUpperCase();
    const lName = manualData.lastName.trim().toUpperCase();

    // Check locally first
    const existing = dbStudents.find(
      (s) =>
        s.first_name?.toUpperCase() === fName &&
        s.last_name?.toUpperCase() === lName,
    );

    if (existing) {
      toast.info("El alumno ya existe.", {
        description: "Se ha seleccionado automáticamente.",
      });
      setSelectedStudent(existing);
      setStep(2);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("students")
        .insert([
          {
            first_name: fName,
            last_name: lName,
            grade: selectedGrade,
            section: selectedSection,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setDbStudents((prev) => [...prev, data]);
      setSelectedStudent(data);
      toast.success("Alumno registrado y seleccionado");
      setStep(2);
    } catch (error: any) {
      toast.error("Error al crear alumno: " + error.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !severity || !description) return;

    const isAuthorized = [
      "COORDINADOR",
      "BRIGADIER_GENERAL_PRINCIPAL",
      "DEVELOPER",
      "PSYCHOLOGIST",
    ].includes(user?.role || "");

    let submitStatus = "PENDIENTE";
    let submitNeedsPsychology = needsPsychology;

    if (needsPsychology && !isAuthorized) {
      submitStatus = "ESCALADA";
      submitNeedsPsychology = false; // Prevents it from appearing in Psychology inbox directly
    }

    const { error } = await supabase.from("incidents").insert([
      {
        student_id: selectedStudent.id,
        type: severity,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        description: description,
        status: submitStatus,
        needs_psychology: submitNeedsPsychology,
        reporter_id: user?.id,
      },
    ]);

    if (!error) {
      if (submitStatus === "ESCALADA") {
        toast.success(
          "Incidencia enviada a revisión para elevación a psicología.",
        );
      } else {
        toast.success("Incidencia registrada correctamente");
      }
      // Reload
      const { data } = await supabase
        .from("incidents")
        .select("*, students(*)");
      if (data) setDbIncidents(data);
    } else {
      toast.error("Error al guardar en BD: " + error.message);
    }

    // Reset form
    setStep(1);
    setSelectedStudent(null);
    setSeverity(null);
    setDescription("");
    setNeedsPsychology(false);
    setDescription("");
    setSearchTerm("");
    setSelectedGrade("");
    setSelectedSection("");
    if (canViewHistory) {
      setActiveTab("HISTORY");
    } else {
      setActiveTab("NEW");
    }
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
          {canViewHistory && (
            <button
              onClick={() => setActiveTab("HISTORY")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "HISTORY" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
            >
              Historial
            </button>
          )}
        </div>
      </div>

      {activeTab === "HISTORY" && canViewHistory && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Historial de
              Incidencias
            </h3>

            {/* Main Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  value={historyTimeRange}
                  onChange={(e) => setHistoryTimeRange(e.target.value as any)}
                >
                  <option value="ALL">Fecha</option>
                  <option value="TODAY">Hoy</option>
                  <option value="WEEK">Esta Semana</option>
                  <option value="MONTH">Este Mes</option>
                  <option value="CUSTOM">Elegir...</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  value={historyGrade}
                  onChange={(e) => setHistoryGrade(e.target.value)}
                >
                  <option value="ALL">Grado</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  value={historyStatus}
                  onChange={(e) => setHistoryStatus(e.target.value)}
                >
                  <option value="ALL">Estado</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ATENDIDA">Atendida</option>
                  <option value="ESCALADA">Escalada</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  value={historyType}
                  onChange={(e) => setHistoryType(e.target.value)}
                >
                  <option value="ALL">Gravedad</option>
                  <option value="LEVE">Leve</option>
                  <option value="MODERADA">Moderada</option>
                  <option value="GRAVE">Grave</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  value={historyOrigin}
                  onChange={(e) => setHistoryOrigin(e.target.value)}
                >
                  <option value="ALL">Origen</option>
                  <option value="PATRULLA">Brig. Patrulla</option>
                  <option value="AULA">Brig. Aula</option>
                </select>
              </div>
            </div>

            {/* Custom Date Picker (Only if CUSTOM selected) */}
            {historyTimeRange === "CUSTOM" && (
              <div className="mb-3 animate-in fade-in slide-in-from-top-1">
                <input
                  type="date"
                  className="p-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={historyCustomDate}
                  onChange={(e) => setHistoryCustomDate(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/50">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando <b>{filteredHistory.length}</b> registros
              </span>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
              >
                Orden: {sortOrder === "desc" ? "Más recientes" : "Más antiguos"}
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No se encontraron incidencias con estos filtros.</p>
              </div>
            ) : (
              filteredHistory.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 flex flex-col hover:bg-slate-50 gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${inc.type === "GRAVE" ? "bg-red-500" : inc.type === "MODERADA" ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                      <div>
                        <p className="font-bold text-slate-800">
                          {inc.students?.first_name} {inc.students?.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {inc.date} • {inc.time}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span className="font-medium">Reportado por:</span>
                          {inc.reporter?.name || "Sistema"}{" "}
                          {inc.reporter?.role && (
                            <span className="bg-slate-100 px-1 rounded text-slate-500">
                              {inc.reporter.role
                                .replace("BRIGADIER_", "")
                                .replace("_", " ")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                      {inc.type}
                    </span>
                  </div>

                  <div className="pl-5">
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-semibold text-slate-700">
                        Descripción:
                      </span>{" "}
                      {inc.description}
                    </p>

                    {(inc.needs_psychology || inc.status === "ESCALADA") && (
                      <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase text-indigo-700 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {inc.status === "ESCALADA"
                              ? "Solicitud de Psicología"
                              : "Derivado a Psicología"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inc.status === "ATENDIDA" ? "bg-emerald-100 text-emerald-700" : inc.status === "ESCALADA" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {inc.status === "ATENDIDA"
                              ? "ATENDIDO"
                              : inc.status === "ESCALADA"
                                ? "EN REVISIÓN"
                                : "PENDIENTE"}
                          </span>
                        </div>
                        {inc.status === "ATENDIDA" && inc.psych_notes && (
                          <p className="text-xs text-indigo-900 mt-2 border-t border-indigo-200/50 pt-2">
                            <span className="font-semibold block mb-1">
                              Resultado / Notas:
                            </span>
                            {inc.psych_notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  1. Identificar Alumno
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsManualEntry(!isManualEntry)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                >
                  {isManualEntry ? "Buscar Existente" : "Agregar Nuevo"}
                </Button>
              </div>

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

              {isManualEntry ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-2">
                    <p className="text-xs text-indigo-700 mb-2 font-medium">
                      Ingrese los datos del nuevo estudiante. Si ya existe, se
                      seleccionará automáticamente.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                          Nombres
                        </label>
                        <input
                          type="text"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                          value={manualData.firstName}
                          onChange={(e) =>
                            setManualData({
                              ...manualData,
                              firstName: e.target.value,
                            })
                          }
                          placeholder="Ej. JUAN CARLOS"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                          value={manualData.lastName}
                          onChange={(e) =>
                            setManualData({
                              ...manualData,
                              lastName: e.target.value,
                            })
                          }
                          placeholder="Ej. PEREZ LOPEZ"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleManualSubmit}
                      disabled={
                        !selectedGrade ||
                        !selectedSection ||
                        !manualData.firstName ||
                        !manualData.lastName
                      }
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                    >
                      Crear y Continuar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm"
                      placeholder="Buscar por nombre..."
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
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {student.grade} - Secc. {student.section}
                            </p>
                          </div>
                          {selectedStudent?.id === student.id && (
                            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm flex flex-col items-center">
                        <p className="mb-2">
                          No se encontraron alumnos con los filtros actuales.
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsManualEntry(true)}
                        >
                          Agregar Manualmente
                        </Button>
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
                </>
              )}
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

              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm">
                    ¿Elevar a Psicología?
                  </h4>
                  <p className="text-xs text-indigo-700/80 mt-1">
                    Marque esta casilla si considera que el estudiante requiere
                    evaluación o soporte psicológico inmediato.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={needsPsychology}
                  onChange={(e) => setNeedsPsychology(e.target.checked)}
                  className="w-6 h-6 rounded-md text-indigo-600 border-indigo-300 focus:ring-indigo-500"
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
                    {selectedStudent?.first_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">
                      Alumno
                    </p>
                    <p className="font-bold text-slate-800 text-lg">
                      {selectedStudent?.first_name} {selectedStudent?.last_name}
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-slate-900 shadow-lg shadow-emerald-500/20 w-40"
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
