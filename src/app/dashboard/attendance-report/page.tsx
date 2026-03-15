"use client";

import { useState, useEffect } from "react";
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
  eachDayOfInterval,
  isSameDay,
  parseISO,
  subMonths,
  addMonths,
} from "date-fns";
import { es } from "date-fns/locale";

export default function AttendanceReportPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);

    // Obtener usuarios brigadieres
    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, document_id, role")
      .neq("role", "PROFESSOR_ADMIN")
      .order("name");

    if (usersData) setUsers(usersData);

    const start = startOfMonth(currentDate).toISOString();
    const end = endOfMonth(currentDate).toISOString();

    // Obtener asistencias del mes
    const { data: attData } = await supabase
      .from("attendance_scans")
      .select("*, users(name)")
      .gte("scanned_at", start)
      .lte("scanned_at", end);

    if (attData) setAttendances(attData);
    setLoading(false);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getAttendanceForUserAndDay = (userId: string, day: Date) => {
    return attendances.find(
      (a) => a.user_id === userId && isSameDay(parseISO(a.scanned_at), day),
    );
  };

  const generateCSV = () => {
    // Generar cabeceras
    let csvContent = "Brigadier,DNI,Rol,";
    daysInMonth.forEach((day) => {
      csvContent += `${format(day, "dd/MM")},`;
    });
    csvContent += "\n";

    // Generar filas
    users.forEach((user) => {
      csvContent += `"${user.name}","${user.document_id || ""}","${user.role}",`;

      daysInMonth.forEach((day) => {
        const att = getAttendanceForUserAndDay(user.id, day);
        const status = att ? (att.status === "VERIFIED" ? "A" : "T") : "-";
        csvContent += `${status},`;
      });
      csvContent += "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Rep_Asistencias_${format(currentDate, "MMMM_yyyy")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            Reporte Mensual de Asistencia
          </h1>
          <p className="text-slate-500 mt-1">
            Control detallado de brigadieres
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="min-w-[120px] text-center font-medium text-slate-700 capitalize">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </span>
            <button
              onClick={nextMonth}
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
            <span className="hidden md:inline">Descargar Excel (CSV)</span>
          </Button>
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
                  {daysInMonth.map((day, i) => (
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
                      colSpan={daysInMonth.length + 1}
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
                      {daysInMonth.map((day, i) => {
                        const att = getAttendanceForUserAndDay(user.id, day);
                        const isWeekend =
                          day.getDay() === 0 || day.getDay() === 6;

                        return (
                          <td
                            key={i}
                            className={`p-2 text-center border-r border-slate-100 ${isWeekend ? "bg-slate-50/50" : ""}`}
                          >
                            {att ? (
                              <div
                                className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-bold ${
                                  att.status === "VERIFIED"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                                title={`${format(day, "dd/MM")} - ${att.status}`}
                              >
                                {att.status === "VERIFIED" ? "A" : "T"}
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
          (A) Asistió puntual
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded-sm"></div>{" "}
          (T) Tardanza
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div>{" "}
          (-) Inasistencia / Sin registro
        </div>
      </div>
    </div>
  );
}
