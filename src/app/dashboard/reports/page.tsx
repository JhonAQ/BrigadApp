"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Maximize,
  Minimize,
  Presentation,
  TrendingUp,
  AlertTriangle,
  Users,
  BrainCircuit,
  Calendar,
  Award,
  Target,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function ReportsPresentationArgsPage() {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [monthName, setMonthName] = useState("");
  const [stats, setStats] = useState<any>(null);

  // Colores para gráficos
  const COLORS = [
    "#4f46e5",
    "#ec4899",
    "#06b6d4",
    "#14b8a6",
    "#f59e0b",
    "#ef4444",
  ];

  useEffect(() => {
    fetchReportData();

    // Configurar nombre del mes actual
    const now = new Date();
    setMonthName(format(now, "MMMM yyyy", { locale: es }).toUpperCase());
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const firstDay = startOfMonth(now).toISOString();
      const lastDay = endOfMonth(now).toISOString();

      const prevFirstDay = startOfMonth(subMonths(now, 1)).toISOString();
      const prevLastDay = endOfMonth(subMonths(now, 1)).toISOString();

      // Obtener incidencias del mes actual
      const { data: currentIncidents } = await supabase
        .from("incidents")
        .select(
          "*, students(first_name, last_name, grade, section), users(name, role)",
        )
        .gte("date", firstDay.split("T")[0])
        .lte("date", lastDay.split("T")[0]);

      // Incidencias del mes anterior (para comparación)
      const { data: prevIncidents } = await supabase
        .from("incidents")
        .select("id")
        .gte("date", prevFirstDay.split("T")[0])
        .lte("date", prevLastDay.split("T")[0]);

      if (currentIncidents) {
        processData(currentIncidents, prevIncidents || []);
      }
    } catch (error) {
      console.error("Error fetching report data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processData = (current: any[], prev: any[]) => {
    // 1. KPIs Básicos
    const totalCurrent = current.length;
    const totalPrev = prev.length;
    const growth =
      totalPrev === 0
        ? 100
        : Math.round(((totalCurrent - totalPrev) / totalPrev) * 100);

    const psychologyCases = current.filter((i) => i.needs_psychology).length;
    const resolvedCases = current.filter(
      (i) => i.status === "ATENDIDA" || i.status === "RESUELTO",
    ).length;

    // 2. Tipos de Infracción (Para Pie Chart)
    const typeCount = current.reduce((acc: any, inc) => {
      acc[inc.type] = (acc[inc.type] || 0) + 1;
      return acc;
    }, {});
    const typeChartData = Object.keys(typeCount).map((k) => ({
      name: k,
      value: typeCount[k],
    }));

    // 3. Casos por Grado (Para Bar Chart)
    const gradeCount = current.reduce((acc: any, inc) => {
      const grade = inc.students?.grade || "Desconocido";
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
    const gradeChartData = Object.keys(gradeCount)
      .map((k) => ({ name: k, Casos: gradeCount[k] }))
      .sort((a, b) => b.Casos - a.Casos);

    // 4. Estudiantes Recurrentes
    const studentCount = current.reduce((acc: any, inc) => {
      const studentId = inc.student_id;
      if (!studentId) return acc;
      if (!acc[studentId]) {
        const studentName = inc.students
          ? `${inc.students.first_name} ${inc.students.last_name}`
          : "Desconocido";
        acc[studentId] = {
          name: studentName,
          grade: `${inc.students?.grade} ${inc.students?.section}`,
          count: 0,
        };
      }
      acc[studentId].count += 1;
      return acc;
    }, {});
    const topStudents = Object.values(studentCount)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // 5. Ranking de Brigadieres (Top Reportadores)
    const reporterCount = current.reduce((acc: any, inc) => {
      const reporterName = inc.users?.name || "Desconocido";
      acc[reporterName] = (acc[reporterName] || 0) + 1;
      return acc;
    }, {});
    const topBrigadiers = Object.keys(reporterCount)
      .map((k) => ({ name: k, Reportes: reporterCount[k] }))
      .sort((a: any, b: any) => b.Reportes - a.Reportes)
      .slice(0, 5);

    setStats({
      totalCurrent,
      growth,
      psychologyCases,
      resolutionRate:
        totalCurrent > 0 ? Math.round((resolvedCases / totalCurrent) * 100) : 0,
      typeChartData,
      gradeChartData,
      topStudents,
      topBrigadiers,
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Slides rendering definitions
  const SLIDES = [
    // SLIDE 0: INICIO
    () => (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-4">
          <Presentation className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
          Balance Mensual de <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
            Disciplina y Convivencia
          </span>
        </h1>
        <div className="bg-slate-100 px-6 py-3 rounded-full border border-slate-200 shadow-inner">
          <p className="text-xl font-bold text-slate-600 uppercase tracking-widest flex items-center gap-3">
            <Calendar className="w-5 h-5" /> {monthName}
          </p>
        </div>
        <p className="text-slate-500 font-medium max-w-xl mx-auto mt-4 text-lg">
          Sesión de revisión ejecutiva con el cuerpo de Brigadieres y
          Coordinadores.
        </p>
      </div>
    ),

    // SLIDE 1: KPIs
    () => (
      <div className="flex flex-col h-full p-8 md:p-12">
        <h2 className="text-3xl font-black text-slate-800 mb-10 flex items-center gap-3 border-b pb-4">
          <Target className="w-8 h-8 text-indigo-600" /> Indicadores Clave de
          Rendimiento (KPIs)
        </h2>

        <div className="grid grid-cols-2 gap-8 h-full">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
            <TrendingUp className="absolute -right-6 -top-6 w-48 h-48 text-white/10" />
            <div>
              <p className="text-indigo-100 font-bold uppercase tracking-wider text-sm mb-2">
                Total Casos Registrados
              </p>
              <h3 className="text-7xl font-black">{stats.totalCurrent}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-md self-start px-4 py-2 rounded-xl mt-4">
              <p className="font-semibold text-sm flex items-center gap-2">
                {stats.growth > 0 ? "📈" : "📉"} {Math.abs(stats.growth)}%{" "}
                {stats.growth > 0 ? "más" : "menos"} que el mes anterior
              </p>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-8">
            <div className="bg-white border text-slate-800 border-slate-200 rounded-3xl p-8 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">
                  Tasa de Resolución
                </p>
                <h3 className="text-4xl font-black text-emerald-600">
                  {stats.resolutionRate}%
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-2">
                  Casos marcados como "Resueltos"
                </p>
              </div>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white border text-slate-800 border-slate-200 rounded-3xl p-8 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">
                  Derivaciones a Psicología
                </p>
                <h3 className="text-4xl font-black text-rose-600">
                  {stats.psychologyCases}
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-2">
                  Requieren atención profesional
                </p>
              </div>
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    // SLIDE 2: GRAFICOS DE FALTAS
    () => (
      <div className="flex flex-col h-full p-8 md:p-12">
        <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 border-b pb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" /> Análisis de
          Infracciones
        </h2>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-700 mb-4">
              Distribución por Tipo
            </h3>
            <div className="w-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.typeChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${value} casos`,
                      "Frecuencia",
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-700 mb-4">
              Afectación por Grados
            </h3>
            <div className="w-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.gradeChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12, fontWeight: "bold" }}
                  />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} />
                  <Bar
                    dataKey="Casos"
                    fill="#6366f1"
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    ),

    // SLIDE 3: ESTUDIANTES CRITICOS
    () => (
      <div className="flex flex-col h-full p-8 md:p-12">
        <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 border-b pb-4">
          <Users className="w-8 h-8 text-rose-500" /> Foco de Atención:
          Estudiantes Recurrentes
        </h2>

        <div className="bg-white border border-rose-100 rounded-3xl shadow-xl shadow-rose-50/50 p-8 flex-1 overflow-hidden">
          <p className="text-slate-500 mb-6 font-medium">
            Top 5 estudiantes con mayor cantidad de incidencias registradas este
            mes (Requieren Intervención):
          </p>

          <div className="space-y-4">
            {stats.topStudents.length > 0 ? (
              stats.topStudents.map((student: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 bg-slate-50 hover:bg-rose-50 transition-colors border-l-4 border-rose-500 rounded-r-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full font-black text-xl text-rose-600 flex items-center justify-center border border-slate-200">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 uppercase">
                        {student.name}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium">
                        Grado/Sección: {student.grade}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-rose-600">
                      {student.count}
                    </span>
                    <span className="text-sm font-bold text-rose-400 block -mt-1">
                      Incidencias
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-400 font-bold">
                No hay estudiantes recurrentes este mes. ¡Excelente entorno!
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    // SLIDE 4: RENDIMIENTO BRIGADIERES
    () => (
      <div className="flex flex-col h-full p-8 md:p-12">
        <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 border-b pb-4">
          <Award className="w-8 h-8 text-amber-500" /> Rendimiento de Patrullaje
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
          <div className="md:col-span-1 bg-amber-50 rounded-3xl p-8 border border-amber-200 flex flex-col justify-center items-center text-center">
            <Award className="w-32 h-32 text-amber-400 mb-6" />
            <h3 className="text-2xl font-black text-amber-900 mb-2">
              Brigadieres de Alto Impacto
            </h3>
            <p className="text-amber-700/80 font-medium">
              Este ranking reconoce a los brigadieres con mayor nivel de reporte
              proactivo y aseguramiento del orden mensual.
            </p>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.topBrigadiers}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fontWeight: "bold" }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="Reportes"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                  label={{
                    position: "top",
                    fill: "#92400e",
                    fontWeight: "bold",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    ),

    // SLIDE 5: DISCUSION Y PLAN
    () => (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-indigo-900 rounded-[3rem] mx-8 my-8 shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <FileSpreadsheet className="w-20 h-20 text-indigo-300 mb-8 relative z-10" />
        <h2 className="text-5xl font-black mb-6 relative z-10">
          Conclusiones y Acuerdos
        </h2>
        <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-12 relative z-10 leading-relaxed">
          Apertura de la mesa de debate directivo. Basados en la data
          presentada, definir el plan de acción táctico para el próximo mes.
        </p>

        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-left relative z-10">
          <ul className="list-disc list-inside space-y-3 text-lg font-medium text-indigo-50">
            <li>
              ¿Qué infracción requiere nueva normativa o campaña de
              concientización?
            </li>
            <li>
              Revisión de estudiantes recurrentes con el departamento de
              Psicología.
            </li>
            <li>
              Reevaluación de zonas de patrullaje basándonos en los grados más
              conflictivos.
            </li>
          </ul>
        </div>
      </div>
    ),
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, [SLIDES.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 min-h-[600px] rounded-3xl border border-slate-200">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">
          Agrupando análisis de Big Data...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[100] bg-slate-900 p-4" : "h-[calc(100vh-100px)] min-h-[700px] bg-slate-100 rounded-3xl border border-slate-200 shadow-inner p-4 relative overflow-hidden flex flex-col"}`}
    >
      {/* PANTALLA PRINCIPAL DE DIAPOSITIVAS */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden relative">
        {/* Barra de progreso */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-50">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
          ></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {SLIDES[currentSlide]()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BARRA DE CONTROLES INFERIOR */}
      <div className="shrink-0 mt-4 flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleFullscreen}
            className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors tooltip-trigger"
            title="Pantalla Completa (F)"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">
            Diapositiva {currentSlide + 1} de {SLIDES.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Anterior
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === SLIDES.length - 1}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all active:scale-95"
          >
            Siguiente <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
