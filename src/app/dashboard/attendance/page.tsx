"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AttendanceRecord } from "@/lib/types";
import { MOCK_ATTENDANCE, MOCK_USERS } from "@/lib/mock-data";
import {
  getTodayISO,
  formatDate,
  getStatusColor,
  getStatusLabel,
  generateId,
} from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import {
  Plus,
  Search,
  QrCode,
  CalendarCheck,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
} from "lucide-react";

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [qrResult, setQrResult] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    studentId: "",
    status: "present" as AttendanceRecord["status"],
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
  });

  const brigadiers = useMemo(
    () => MOCK_USERS.filter((u) => u.role === "brigadier" && u.active),
    []
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesDate = r.date === selectedDate;
      const matchesSearch =
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.grade.includes(search) ||
        r.section.includes(search);
      const matchesStatus =
        filterStatus === "all" || r.status === filterStatus;
      return matchesDate && matchesSearch && matchesStatus;
    });
  }, [records, selectedDate, search, filterStatus]);

  const todayStats = useMemo(() => {
    const dayRecords = records.filter((r) => r.date === selectedDate);
    return {
      present: dayRecords.filter((r) => r.status === "present").length,
      absent: dayRecords.filter((r) => r.status === "absent").length,
      late: dayRecords.filter((r) => r.status === "late").length,
      excused: dayRecords.filter((r) => r.status === "excused").length,
      total: dayRecords.length,
    };
  }, [records, selectedDate]);

  function handleRegister() {
    if (!form.studentId) return;
    const student = MOCK_USERS.find((u) => u.id === form.studentId);
    if (!student) return;

    // Check if already registered
    const existing = records.find(
      (r) => r.studentId === form.studentId && r.date === selectedDate
    );
    if (existing) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === existing.id
            ? { ...r, status: form.status, time: form.time, notes: form.notes }
            : r
        )
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: generateId("att"),
        studentId: form.studentId,
        studentName: student.name,
        grade: student.grade ?? "",
        section: student.section ?? "",
        date: selectedDate,
        status: form.status,
        registeredBy: user?.name ?? "Sistema",
        time: form.time,
        notes: form.notes,
      };
      setRecords((prev) => [...prev, newRecord]);
    }
    setRegisterModalOpen(false);
    setForm({
      studentId: "",
      status: "present",
      time: new Date().toTimeString().slice(0, 5),
      notes: "",
    });
  }

  function handleQRScan() {
    // Simulate QR scanning - look up student code
    const student = MOCK_USERS.find(
      (u) =>
        u.studentCode?.toLowerCase() === qrInput.trim().toLowerCase() ||
        u.id === qrInput.trim()
    );
    if (student) {
      const existing = records.find(
        (r) => r.studentId === student.id && r.date === selectedDate
      );
      if (existing) {
        setQrResult(`Ya registrado: ${student.name} – ${getStatusLabel(existing.status, "attendance")}`);
      } else {
        const newRecord: AttendanceRecord = {
          id: generateId("att"),
          studentId: student.id,
          studentName: student.name,
          grade: student.grade ?? "",
          section: student.section ?? "",
          date: selectedDate,
          status: "present",
          registeredBy: user?.name ?? "Sistema",
          time: new Date().toTimeString().slice(0, 5),
        };
        setRecords((prev) => [...prev, newRecord]);
        setQrResult(`Registrado: ${student.name} – Presente`);
      }
    } else {
      setQrResult("No se encontró ningún brigadista con ese código.");
    }
    setQrInput("");
  }

  const statusIcons: Record<string, React.ReactNode> = {
    present: <CheckCircle size={15} className="text-green-600" />,
    absent: <XCircle size={15} className="text-red-600" />,
    late: <Clock size={15} className="text-yellow-600" />,
    excused: <FileCheck size={15} className="text-blue-600" />,
  };

  return (
    <div className="space-y-5">
      {/* Date picker & actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-sm text-slate-500">
            {formatDate(selectedDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setQrResult(null);
              setQrModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <QrCode size={16} />
            <span className="hidden sm:inline">Escanear QR</span>
          </button>
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Registrar</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Presentes",
            value: todayStats.present,
            color: "text-green-700 bg-green-50",
          },
          {
            label: "Ausentes",
            value: todayStats.absent,
            color: "text-red-700 bg-red-50",
          },
          {
            label: "Tardanzas",
            value: todayStats.late,
            color: "text-yellow-700 bg-yellow-50",
          },
          {
            label: "Justificados",
            value: todayStats.excused,
            color: "text-blue-700 bg-blue-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm`}
          >
            <p className={`text-xl font-bold ${s.color.split(" ")[0]}`}>
              {s.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm text-slate-700 bg-transparent focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="present">Presentes</option>
            <option value="absent">Ausentes</option>
            <option value="late">Tardanza</option>
            <option value="excused">Justificado</option>
          </select>
        </div>
      </div>

      {/* Records list */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estudiante
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Grado
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hora
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notas
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Registrado por
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">
                      {rec.studentName}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {rec.grade} {rec.section}
                  </td>
                  <td className="px-5 py-3 text-slate-600 font-mono text-xs">
                    {rec.time ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                        rec.status,
                        "attendance"
                      )}`}
                    >
                      {statusIcons[rec.status]}
                      {getStatusLabel(rec.status, "attendance")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {rec.notes ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {rec.registeredBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <CalendarCheck
                size={40}
                className="mx-auto mb-3 text-slate-200"
              />
              <p className="text-slate-400 font-medium">
                No hay registros para esta fecha
              </p>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  {rec.studentName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {rec.grade} {rec.section} · {rec.time ?? "—"} ·{" "}
                  {rec.registeredBy}
                </p>
                {rec.notes && (
                  <p className="text-xs text-slate-400 mt-0.5 italic">
                    {rec.notes}
                  </p>
                )}
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                  rec.status,
                  "attendance"
                )}`}
              >
                {statusIcons[rec.status]}
                {getStatusLabel(rec.status, "attendance")}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="font-medium">No hay registros para esta fecha</p>
            </div>
          )}
        </div>
      </div>

      {/* Register modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Registrar Asistencia"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Brigadista *
            </label>
            <select
              value={form.studentId}
              onChange={(e) =>
                setForm((f) => ({ ...f, studentId: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleccionar brigadista...</option>
              {brigadiers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} – {b.grade} {b.section}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Estado *
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as AttendanceRecord["status"],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="present">Presente</option>
                <option value="absent">Ausente</option>
                <option value="late">Tardanza</option>
                <option value="excused">Justificado</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Hora
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Notas (opcional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              placeholder="Observaciones..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleRegister}
              disabled={!form.studentId}
              className="flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Registrar
            </button>
          </div>
        </div>
      </Modal>

      {/* QR Scanner modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Escanear Código QR"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center rounded-2xl bg-slate-100 p-8">
            <div className="text-center">
              <QrCode size={48} className="mx-auto mb-3 text-slate-400" />
              <p className="text-xs text-slate-500">
                Escanea el QR del brigadista
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Código del brigadista
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQRScan()}
                placeholder="Ej: 2024-001"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleQRScan}
                disabled={!qrInput.trim()}
                className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                OK
              </button>
            </div>
          </div>

          {qrResult && (
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                qrResult.includes("No se encontró")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {qrResult}
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">
            También puedes ingresar el ID del usuario o código de estudiante
          </p>
        </div>
      </Modal>
    </div>
  );
}
