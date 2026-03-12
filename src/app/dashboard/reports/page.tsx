"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Trophy, TrendingUp, Clock, Ban, Presentation } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MOCK_INCIDENTS_BY_TYPE = [
  { name: "Leve", value: 45, color: "#34d399" },
  { name: "Moderada", value: 25, color: "#fbbf24" },
  { name: "Grave", value: 10, color: "#f43f5e" },
];

const MOCK_INCIDENTS_BY_GRADE = [
  { name: "1ro", count: 5 },
  { name: "2do", count: 12 },
  { name: "3ro", count: 25 }, // Problematic grade
  { name: "4to", count: 18 },
  { name: "5to", count: 8 },
];

const TOP_STUDENTS = [
  { name: "Juan Perez", score: 98, grade: "5to A" },
  { name: "Maria Lopez", score: 95, grade: "4to B" },
  { name: "Carlos Ruiz", score: 92, grade: "5to C" },
];

export default function ReportsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div
      className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-900 p-8 overflow-y-auto text-slate-200" : ""}`}
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-500" />
            Reportes y Métricas
          </h1>
          <p
            className={`text-sm ${isFullscreen ? "text-slate-400" : "text-slate-500"}`}
          >
            Estadísticas generales del mes actual.
          </p>
        </div>
        <Button
          onClick={toggleFullscreen}
          variant={isFullscreen ? "secondary" : "primary"}
        >
          <Presentation className="w-4 h-4 mr-2" />
          {isFullscreen ? "Salir del Modo Presentación" : "Modo Presentación"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div
          className={`p-6 rounded-2xl border ${isFullscreen ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
            Total Incidencias
          </h3>
          <p className="text-3xl font-bold flex items-end gap-2 text-indigo-500">
            80
            <span className="text-xs text-emerald-500 font-medium mb-1 flex items-center">
              +12% <TrendingUp className="w-3 h-3 ml-0.5" />
            </span>
          </p>
        </div>
        <div
          className={`p-6 rounded-2xl border ${isFullscreen ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
            Casos Atendidos
          </h3>
          <p className="text-3xl font-bold flex items-end gap-2 text-emerald-500">
            65%
          </p>
        </div>
        <div
          className={`p-6 rounded-2xl border ${isFullscreen ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
            Hora Pico
          </h3>
          <p className="text-3xl font-bold flex items-end gap-2 text-amber-500">
            10:30 AM
            <Clock className="w-5 h-5 mb-1 opacity-50" />
          </p>
        </div>
        <div
          className={`p-6 rounded-2xl border ${isFullscreen ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
            Indumentaria
          </h3>
          <p className="text-3xl font-bold flex items-end gap-2 text-rose-500">
            15
            <span className="text-xs text-slate-500 font-medium mb-1">
              Infracciones
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Incidents by Grade */}
        <div
          className={`p-6 rounded-2xl border ${isFullscreen ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <h3 className="font-bold mb-6 flex items-center gap-2">
            Incidencias por Grado
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_INCIDENTS_BY_GRADE}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isFullscreen ? "#334155" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="name"
                  stroke={isFullscreen ? "#94a3b8" : "#64748b"}
                />
                <YAxis stroke={isFullscreen ? "#94a3b8" : "#64748b"} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isFullscreen ? "#1e293b" : "#fff",
                    borderColor: isFullscreen ? "#334155" : "#e2e8f0",
                    color: isFullscreen ? "#fff" : "#000",
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Incidents by Type */}
        <div
          className={`p-6 rounded-2xl border ${isFullscreen ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <h3 className="font-bold mb-6 flex items-center gap-2">
            Distribución por Gravedad
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_INCIDENTS_BY_TYPE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_INCIDENTS_BY_TYPE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ranking */}
      <div
        className={`p-6 rounded-2xl border ${isFullscreen ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}
      >
        <h3 className="font-bold mb-6 flex items-center gap-2 text-amber-500">
          <Trophy className="w-6 h-6" />
          Top 3 Brigadieres (Desempeño)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOP_STUDENTS.map((student, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-xl border flex flex-col items-center text-center ${index === 0 ? "bg-amber-50/10 border-amber-200" : "bg-slate-50/10 border-slate-700"}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-lg ${
                  index === 0
                    ? "bg-amber-400 text-white"
                    : index === 1
                      ? "bg-slate-300 text-slate-600"
                      : "bg-orange-300 text-orange-800"
                }`}
              >
                {index + 1}
              </div>
              <h4
                className={`font-bold ${isFullscreen ? "text-white" : "text-slate-800"}`}
              >
                {student.name}
              </h4>
              <p className="text-xs text-slate-400 mb-2">{student.grade}</p>
              <p className="text-2xl font-black text-indigo-500">
                {student.score} pts
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
