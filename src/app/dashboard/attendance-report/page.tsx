"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
// xlsx-js-style permite estilos en el export
import * as XLSX from "xlsx-js-style";

type CellStyle = any;
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [relationTried, setRelationTried] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [roleFilter, setRoleFilter] = useState<string>("TODOS");

  const authorizedRoles = [
    "DOCENTE",
    "BRIGADIER_GENERAL_PRINCIPAL",
    "DEVELOPER",
  ];

  useEffect(() => {
    if (user && !authorizedRoles.includes(user.role || "")) {
      router.push("/dashboard");
      toast.error("No tienes permisos para acceder a esta sección.");
    } else {
      fetchData();
    }
  }, [currentDate, viewMode, user]);

  const fetchData = async () => {
    setLoading(true);

    const { data: usersData } = await supabase
      .from("users")
      .select("id,name,dni,role,grade,section")
      .in("role", [
        "BRIGADIER_AULA",
        "BRIGADIER_PATRULLA",
        "BRIGADIER_GENERAL_PRINCIPAL",
        "BRIGADIER_GENERAL_ALTERNO",
      ])
      .order("name");
    if (usersData) setUsers(usersData);

    const range = (() => {
      const monthStart = startOfMonth(currentDate).toISOString().slice(0, 10);
      const monthEnd = endOfMonth(currentDate).toISOString().slice(0, 10);

      let viewStart, viewEnd;

      if (viewMode === "day") {
        viewStart = startOfDay(currentDate).toISOString().slice(0, 10);
        viewEnd = endOfDay(currentDate).toISOString().slice(0, 10);
      } else if (viewMode === "week") {
        viewStart = startOfWeek(currentDate, { weekStartsOn: 1 })
          .toISOString()
          .slice(0, 10);
        viewEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
          .toISOString()
          .slice(0, 10);
      } else {
        viewStart = monthStart;
        viewEnd = monthEnd;
      }

      return {
        start: viewStart < monthStart ? viewStart : monthStart,
        end: viewEnd > monthEnd ? viewEnd : monthEnd,
      };
    })();

    const fetchWithRelation = async (relation: string) =>
      supabase
        .from("attendance")
        .select(
          `id,date,created_at,uniform_complete,on_time,user_id,
          user:users!${relation}(id,name,dni,role,grade,section)`,
        )
        .gte("date", range.start)
        .lte("date", range.end);

    let relation = relationTried || "attendance_user_id_fkey";
    let { data: attData, error } = await fetchWithRelation(relation);

    if (error && error.code === "PGRST201") {
      relation =
        relation === "attendance_user_id_fkey"
          ? "fk_attendance_user_id"
          : relation;
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
      const parsed = parseISO(
        typeof dateStr === "string" ? dateStr : new Date(dateStr).toISOString(),
      );
      return a.user_id === userId && isSameDay(parsed, day);
    });
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === "TODOS") return users;
    if (roleFilter === "GENERALES") {
      return users.filter((u) => u.role.includes("GENERAL"));
    }
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const filteredAttendances = useMemo(() => {
    const userIds = new Set(filteredUsers.map((u) => u.id));
    return attendances.filter((a) => userIds.has(a.user_id));
  }, [attendances, filteredUsers]);

  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const punctual = filteredAttendances.filter((a) => a.on_time).length;
    const late = total - punctual;
    const uniformOk = filteredAttendances.filter(
      (a) => a.uniform_complete,
    ).length;
    return { total, punctual, late, uniformOk };
  }, [filteredAttendances]);

  const calculateMonthlyStats = (userId: string) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const userMonthAtt = attendances.filter((a) => {
      const dateStr = a.date || a.scanned_at || a.created_at;
      if (!dateStr) return false;
      const parsed = parseISO(
        typeof dateStr === "string" ? dateStr : new Date(dateStr).toISOString(),
      );
      return a.user_id === userId && parsed >= monthStart && parsed <= monthEnd;
    });

    return {
      tardies: userMonthAtt.filter((a) => !a.on_time).length,
      incompleteUniform: userMonthAtt.filter((a) => !a.uniform_complete).length,
    };
  };

  const exportExcel = () => {
    const dayHeaders = daysInRange.map((day) => format(day, "dd/MM"));
    const summaryHeaders = [
      "Total",
      "Puntuales",
      "Tardanzas",
      "Uniforme C",
      "Uniforme I",
    ];
    // Add monthly stats columns after role
    // New Structure: Brigadier | DNI | Rol | Tardanzas (Mes) | Faltas Indum (Mes) | ...Days... | ...Summary...

    // We update userMap to only be used for the final summary columns if needed, OR we can recalculate everything per row
    // Actually the summary columns at the end are for the VIEW range usually? Or are they total?
    // Let's assume the Summary columns at the end are for the VIEWED range as before.

    const userMap = filteredUsers.reduce(
      (acc, u) => {
        // Filter attendances for the days being shown (daysInRange)
        const relevantAtt = filteredAttendances.filter((a) => {
          const dateStr = a.date || a.scanned_at || a.created_at;
          if (!dateStr) return false;
          const parsed = parseISO(
            typeof dateStr === "string"
              ? dateStr
              : new Date(dateStr).toISOString(),
          );
          return (
            a.user_id === u.id && daysInRange.some((d) => isSameDay(d, parsed))
          );
        });

        acc[u.id] = {
          total: relevantAtt.length,
          punctual: relevantAtt.filter((a) => a.on_time).length,
          uniformComplete: relevantAtt.filter((a) => a.uniform_complete).length,
        };
        return acc;
      },
      {} as Record<
        string,
        { total: number; punctual: number; uniformComplete: number }
      >,
    );

    const aoa: any[][] = [];
    const headerRowValues = [
      "Brigadier",
      "DNI",
      "Rol",
      "Sección",
      "Tardanzas (Mes)",
      "Faltas Indum. (Mes)",
      ...dayHeaders,
      ...summaryHeaders,
    ];
    const titleCols = headerRowValues.length - 1;
    aoa.push([`Reporte de Asistencia - ${periodLabel}`]);
    aoa.push([
      `Vista: ${viewMode.toUpperCase()}`,
      `Generado: ${new Date().toLocaleString("es-PE")}`,
    ]);
    aoa.push([]);

    aoa.push(headerRowValues);

    filteredUsers.forEach((user) => {
      const viewMetrics = userMap[user.id] || {
        total: 0,
        punctual: 0,
        uniformComplete: 0,
      };
      const viewTardy = viewMetrics.total - viewMetrics.punctual;
      const viewUniformIncomplete =
        viewMetrics.total - viewMetrics.uniformComplete;

      const monthlyStats = calculateMonthlyStats(user.id);

      const row = [
        user.name,
        user.dni || "",
        user.role,
        user.grade ? `${user.grade} ${user.section}` : "-",
        monthlyStats.tardies,
        monthlyStats.incompleteUniform,
      ];

      daysInRange.forEach((day) => {
        const att = getAttendanceForUserAndDay(user.id, day);
        if (!att) {
          row.push("-");
          return;
        }
        const status = att.on_time ? "P" : "T";
        const uniform = att.uniform_complete ? "C" : "I";
        row.push(`${status} / ${uniform}`);
      });

      row.push(viewMetrics.total);
      row.push(viewMetrics.punctual);
      row.push(viewTardy);
      row.push(viewMetrics.uniformComplete);
      row.push(viewUniformIncomplete);

      aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const headerFill = { patternType: "solid", fgColor: { rgb: "EEF2FF" } }; // Indigo-50
    const summaryFill = { patternType: "solid", fgColor: { rgb: "ECFEFF" } }; // Cyan-50
    const monthlyStatsFill = {
      patternType: "solid",
      fgColor: { rgb: "FEF3C7" },
    }; // Amber-50
    const borderThin = {
      top: { style: "thin", color: { rgb: "CBD5E1" } },
      bottom: { style: "thin", color: { rgb: "CBD5E1" } },
      left: { style: "thin", color: { rgb: "CBD5E1" } },
      right: { style: "thin", color: { rgb: "CBD5E1" } },
    };

    const applyStyle = (cellRef: string, style: CellStyle) => {
      if (ws[cellRef]) {
        ws[cellRef].s = style;
      }
    };

    // Merge title row
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: titleCols } }];

    // Column widths
    ws["!cols"] = [
      { wch: 28 }, // Brigadier
      { wch: 14 }, // DNI
      { wch: 18 }, // Rol
      { wch: 16 }, // Sección
      { wch: 15 }, // Tardanzas Mes
      { wch: 18 }, // Faltas Indum Mes
      ...dayHeaders.map(() => ({ wch: 8 })),
      { wch: 10 }, // Total
      { wch: 10 }, // Puntuales
      { wch: 10 }, // Tardanzas
      { wch: 12 }, // Uniforme C
      { wch: 12 }, // Uniforme I
    ];

    // Style title and meta
    applyStyle("A1", {
      font: { bold: true, sz: 14, color: { rgb: "1F2937" } },
      alignment: { horizontal: "left", vertical: "center" },
    });
    applyStyle("A2", {
      font: { bold: true, color: { rgb: "4B5563" } },
      alignment: { horizontal: "left" },
    });
    applyStyle("B2", {
      font: { color: { rgb: "4B5563" } },
      alignment: { horizontal: "left" },
    });

    // Header row styles (row 4, zero-indexed r=3)
    const headerRow = 4;
    const colLetters = (count: number) => {
      const res: string[] = [];
      for (let i = 0; i < count; i++) {
        let n = i;
        let s = "";
        while (n >= 0) {
          s = String.fromCharCode((n % 26) + 65) + s;
          n = Math.floor(n / 26) - 1;
        }
        res.push(s);
      }
      return res;
    };
    const letters = colLetters(titleCols + 1);
    for (let c = 0; c <= titleCols; c++) {
      const ref = `${letters[c]}${headerRow}`;

      let fill = headerFill;
      // Monthly stats headers are at index 4 and 5
      if (c === 4 || c === 5) fill = monthlyStatsFill;

      applyStyle(ref, {
        font: { bold: true, color: { rgb: "1F2937" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        fill: fill,
        border: borderThin,
      });
    }

    // Data rows styles
    const startDataRow = headerRow + 1;
    const monthlyStatsStartIndex = 4;
    const daysStartIndex = 6;
    const summaryStartIndex = daysStartIndex + dayHeaders.length;

    for (let r = startDataRow; r < aoa.length + 1; r++) {
      for (let c = 0; c <= titleCols; c++) {
        const ref = `${letters[c]}${r}`;
        if (!ws[ref]) continue;

        const isMonthlyStat = c === 4 || c === 5;
        const isSummaryCol = c >= summaryStartIndex;

        let fill = undefined;
        if (isMonthlyStat) fill = monthlyStatsFill;
        if (isSummaryCol) fill = summaryFill;

        applyStyle(ref, {
          alignment: {
            horizontal: c < 4 ? "left" : "center",
            vertical: "center",
          },
          border: borderThin,
          fill: fill,
          font: { color: { rgb: "0F172A" } },
        });
      }
    }

    // Freeze header row and first column
    ws["!freeze"] = { c: 1, r: headerRow };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    const safeLabel = periodLabel.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `Reporte_Asistencia_${viewMode}_${safeLabel}.xlsx`);
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
            Registro de brigadieres de aula, patrulla y generales
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
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2 py-1 text-sm font-medium text-slate-700 bg-transparent outline-none cursor-pointer border-r border-slate-200"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="BRIGADIER_AULA">Brigadieres de Aula</option>
              <option value="BRIGADIER_PATRULLA">
                Brigadieres de Patrulla
              </option>
              <option value="GENERALES">Brigadieres Generales</option>
            </select>
            <button
              onClick={goPrev}
              className="p-1 hover:bg-slate-100 rounded ml-1"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="min-w-[140px] text-center font-medium text-slate-700 capitalize px-2">
              {periodLabel}
            </span>
            <button onClick={goNext} className="p-1 hover:bg-slate-100 rounded">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <Button
            onClick={exportExcel}
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-700 text-slate-900 flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Descargar Excel</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500 font-semibold">
            Total registros
          </p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50">
          <p className="text-xs text-emerald-600 font-semibold">Puntuales</p>
          <p className="text-2xl font-bold text-emerald-700">
            {stats.punctual}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-red-100 bg-red-50">
          <p className="text-xs text-red-600 font-semibold">Tardanzas</p>
          <p className="text-2xl font-bold text-red-700">{stats.late}</p>
        </div>
        <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50">
          <p className="text-xs text-indigo-600 font-semibold">
            Uniforme completo
          </p>
          <p className="text-2xl font-bold text-indigo-700">
            {stats.uniformOk}
          </p>
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
                  <th className="font-semibold p-2 text-xs text-slate-700 text-center border-r border-slate-200 bg-amber-50">
                    Tardanzas
                    <br />
                    (Mes)
                  </th>
                  <th className="font-semibold p-2 text-xs text-slate-700 text-center border-r border-slate-200 bg-amber-50">
                    Faltas U.
                    <br />
                    (Mes)
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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={daysInRange.length + 3}
                      className="p-8 text-center text-slate-500"
                    >
                      No hay brigadieres registrados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
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
                          {user.role === "BRIGADIER_AULA" ||
                          user.role === "BRIGADIER_PATRULLA"
                            ? user.role.replace("BRIGADIER_", "")
                            : "GENERAL"}
                          {user.grade && user.section
                            ? ` - ${user.grade} ${user.section}`
                            : ""}
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm font-bold text-red-600 bg-amber-50/50 border-r border-slate-200">
                        {calculateMonthlyStats(user.id).tardies}
                      </td>
                      <td className="p-2 text-center text-sm font-bold text-slate-700 bg-amber-50/50 border-r border-slate-200">
                        {calculateMonthlyStats(user.id).incompleteUniform}
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
                                  {att.on_time ? "P" : "T"}
                                </div>
                                <div
                                  className={`w-7 h-5 rounded flex items-center justify-center text-[10px] font-semibold ${
                                    att.uniform_complete
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                  title={
                                    att.uniform_complete
                                      ? "Uniforme completo"
                                      : "Uniforme incompleto"
                                  }
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

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded-sm"></div>{" "}
          (P) Puntual
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
