"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Download,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  subMonths,
  addMonths,
  addDays,
} from "date-fns";
import { es } from "date-fns/locale";

export default function AttendanceReportPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [relationTried, setRelationTried] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">(
    "month",
  );

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode]);

  const fetchData = async () => {
    setLoading(true);

    const { data: usersData } = await supabase
      .from("users")
      .select("id,name,dni,role")
      .in("role", ["BRIGADIER_AULA", "BRIGADIER_PATRULLA"])
      .order("name");
    if (usersData) setUsers(usersData);

    const range = (() => {
      if (viewMode === "day") {
        return {
          start: startOfDay(currentDate).toISOString().slice(0, 10),
          end: endOfDay(currentDate).toISOString().slice(0, 10),
        };
      }
      if (viewMode === "week") {
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 })
            .toISOString()
            .slice(0, 10),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
            .toISOString()
            .slice(0, 10),
        };
      }
      return {
        start: startOfMonth(currentDate).toISOString().slice(0, 10),
        end: endOfMonth(currentDate).toISOString().slice(0, 10),
      };
    })();

    const fetchWithRelation = async (relation: string) =>
      supabase
        .from("attendance")
        .select(
          `id,date,created_at,uniform_complete,on_time,user_id,
          user:users!${relation}(id,name,dni,role)`
        )
        .gte("date", range.start)
        .lte("date", range.end);

    let relation = relationTried || "attendance_user_id_fkey";
    let { data: attData, error } = await fetchWithRelation(relation);

    if (error && error.code === "PGRST201") {
      relation = relation === "attendance_user_id_fkey" ? "fk_attendance_user_id" : relation;
      setRelationTried(relation);
      const retry = await fetchWithRelation(relation);
      attData = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Attendance report load error", error);
      setAttendances([]);
    } else {
      setAttendances(attData || []);
    }
    setLoading(false);
  };

  const goNext = () => {
    if (viewMode === "day") setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const goPrev = () => {
    if (viewMode === "day") setCurrentDate(addDays(currentDate, -1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const daysInRange = eachDayOfInterval({
    start:
      viewMode === "day"
        ? startOfDay(currentDate)
        : viewMode === "week"
          ? startOfWeek(currentDate, { weekStartsOn: 1 })
          : startOfMonth(currentDate),
    end:
      viewMode === "day"
        ? endOfDay(currentDate)
        : viewMode === "week"
          ? endOfWeek(currentDate, { weekStartsOn: 1 })
          : endOfMonth(currentDate),
  });

  const getAttendanceForUserAndDay = (userId: string, day: Date) => {
    return attendances.find((a) => {
      const dateStr = a.date || a.scanned_at || a.created_at;
      if (!dateStr) return false;
      const parsed = parseISO(typeof dateStr === "string" ? dateStr : new Date(dateStr).toISOString());
      return a.user_id === userId && isSameDay(parsed, day);
    });
  };

  const stats = useMemo(() => {
    const total = attendances.length;
    const punctual = attendances.filter((a) => a.on_time).length;
    const late = total - punctual;
    const uniformOk = attendances.filter((a) => a.uniform_complete).length;
    return { total, punctual, late, uniformOk };
  }, [attendances]);

  const generateCSV = () => {
    // Generar cabeceras
    let csvContent = "Brigadier,DNI,Rol,";
    daysInRange.forEach((day) => {
      csvContent += `${format(day, "dd/MM")},`;
    });
    csvContent += "\n";

    // Generar filas
    users.forEach((user) => {
      csvContent += `"${user.name}","${user.dni || ""}","${user.role}",`;

      daysInRange.forEach((day) => {
        const att = getAttendanceForUserAndDay(user.id, day);
        const status = att
          ? `${att.on_time ? "A" : "T"}-${att.uniform_complete ? "C" : "I"}`
          : "-";
        csvContent += `${status},`;
      });
      csvContent += "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeLabel = periodLabel.replace(/\s+/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rep_Asistencias_${viewMode}_${safeLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const periodLabel = useMemo(() => {
    if (viewMode === "day") return format(currentDate, "PPP", { locale: es });
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "dd MMM", { locale: es })} - ${format(end, "dd MMM", { locale: es })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: es });
  }, [currentDate, viewMode]);

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            Reporte de Asistencia
          </h1>
          <p className="text-slate-500 mt-1">
            Solo brigadieres de aula y patrulla
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-2 text-sm font-semibold ${
                  viewMode === mode
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {mode === "day" ? "Día" : mode === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={goPrev}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="min-w-[140px] text-center font-medium text-slate-700 capitalize px-2">
              {periodLabel}
            </span>
            <button
              onClick={goNext}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <Button
            onClick={generateCSV}
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 text-slate-900 flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Descargar CSV</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500 font-semibold">Total registros</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50">
          <p className="text-xs text-emerald-600 font-semibold">Puntuales</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.punctual}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-100 bg-red-50">
          <p className="text-xs text-red-600 font-semibold">Tardanzas</p>
          <p className="text-2xl font-bold text-red-700">{stats.late}</p>
        </div>
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50">
          <p className="text-xs text-indigo-600 font-semibold">Uniforme completo</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.uniformOk}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Cargando reporte...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="font-semibold p-3 text-sm text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    Brigadier
                  </th>
                  {daysInRange.map((day, i) => (
                    <th
                      key={i}
                      className="font-semibold p-2 text-xs text-slate-600 text-center border-r border-slate-100 min-w-[36px]"
                    >
                      {format(day, "dd")}
                      <div className="text-[10px] font-normal text-slate-400 capitalize">
                        {format(day, "EE", { locale: es }).substring(0, 2)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={daysInRange.length + 1}
                      className="p-8 text-center text-slate-500"
                    >
                      No hay brigadieres registrados.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td
                        className="p-3 text-sm font-medium text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50 truncate max-w-[200px]"
                        title={user.name}
                      >
                        {user.name}
                        <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                          {user.role}
                        </div>
                      </td>
                      {daysInRange.map((day, i) => {
                        const att = getAttendanceForUserAndDay(user.id, day);
                        const isWeekend =
                          day.getDay() === 0 || day.getDay() === 6;

                        return (
                          <td
                            key={i}
                            className={`p-2 text-center border-r border-slate-100 ${isWeekend ? "bg-slate-50/50" : ""}`}
                          >
                            {att ? (
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className={`w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                                    att.on_time
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                  title={`${format(day, "dd/MM")} - ${att.on_time ? "Puntual" : "Tardanza"}`}
                                >
                                  {att.on_time ? "A" : "T"}
                                </div>
                                <div
                                  className={`w-7 h-5 rounded flex items-center justify-center text-[10px] font-semibold ${
                                    att.uniform_complete
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                  title={att.uniform_complete ? "Uniforme completo" : "Uniforme incompleto"}
                                >
                                  {att.uniform_complete ? "C" : "I"}
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-900 text-xs">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-slate-500 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded-sm"></div>{" "}
          (A) Puntual
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-sm"></div>{" "}
          (T) Tardanza
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded-sm"></div>{" "}
          (C) Uniforme completo
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div>{" "}
          (I) Uniforme incompleto
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div>{" "}
          (-) Inasistencia / Sin registro
        </div>
      </div>
    </div>
  );
}
