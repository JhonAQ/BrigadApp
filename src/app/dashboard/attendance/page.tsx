"use client";

import { useState } from "react";
import { mockBrigadiers, mockAttendance, type AttendanceRecord } from "@/lib/mock";
import { Button } from "@/components/ui/button";

const today = "2026-03-12";

const statusLabels: Record<string, string> = {
  present: "Presente",
  late: "Tardanza",
  absent: "Ausente",
  justified: "Justificado",
};

const statusColors: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  late: "bg-yellow-100 text-yellow-700",
  absent: "bg-red-100 text-red-700",
  justified: "bg-blue-100 text-blue-700",
};

export default function AttendancePage() {
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceRecord["status"]; time?: string; notes?: string }>
  >(() => {
    // Seed with existing records for today
    const map: Record<string, { status: AttendanceRecord["status"]; time?: string; notes?: string }> = {};
    mockAttendance
      .filter((a) => a.date === today)
      .forEach((a) => {
        map[a.brigadierId] = { status: a.status, time: a.time, notes: a.notes };
      });
    return map;
  });

  const [qrMode, setQrMode] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [qrFeedback, setQrFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [filterGrade, setFilterGrade] = useState("all");
  const [saved, setSaved] = useState(false);

  const activeBrigadiers = mockBrigadiers.filter((b) => b.isActive);
  const grades = [...new Set(activeBrigadiers.map((b) => b.grade))].sort();

  const filtered = activeBrigadiers.filter(
    (b) => filterGrade === "all" || b.grade === filterGrade
  );

  function setStatus(id: string, status: AttendanceRecord["status"]) {
    const now = new Date();
    const time =
      status === "present" || status === "late"
        ? `${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")}`
        : undefined;
    setAttendanceMap((prev) => ({ ...prev, [id]: { status, time } }));
    setSaved(false);
  }

  function handleQrScan() {
    const brigadier = mockBrigadiers.find((b) => b.qrCode === qrInput.trim());
    if (brigadier) {
      if (!brigadier.isActive) {
        setQrFeedback({ success: false, message: `${brigadier.name} no está activo en la brigada.` });
      } else {
        setStatus(brigadier.id, "present");
        setQrFeedback({ success: true, message: `✅ ${brigadier.name} marcado como presente.` });
      }
    } else {
      setQrFeedback({ success: false, message: "❌ Código QR no reconocido. Intenta de nuevo." });
    }
    setQrInput("");
    setTimeout(() => setQrFeedback(null), 3000);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const stats = {
    present: Object.values(attendanceMap).filter((r) => r.status === "present").length,
    late: Object.values(attendanceMap).filter((r) => r.status === "late").length,
    absent: Object.values(attendanceMap).filter((r) => r.status === "absent").length,
    justified: Object.values(attendanceMap).filter((r) => r.status === "justified").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Asistencia</h1>
          <p className="text-sm text-gray-500">
            {new Date(today + "T12:00:00").toLocaleDateString("es-PE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button
          variant={qrMode ? "secondary" : "primary"}
          onClick={() => setQrMode(!qrMode)}
          size="sm"
        >
          {qrMode ? "📋 Lista" : "📷 Escanear QR"}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Presentes", count: stats.present, color: "bg-green-50 text-green-700" },
          { label: "Tardanzas", count: stats.late, color: "bg-yellow-50 text-yellow-700" },
          { label: "Ausentes", count: stats.absent, color: "bg-red-50 text-red-700" },
          { label: "Justificados", count: stats.justified, color: "bg-blue-50 text-blue-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
            <p className="text-xl font-bold">{s.count}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* QR Mode */}
      {qrMode && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-3 text-sm font-semibold text-blue-800">
            📷 Registro por código QR
          </h2>
          <p className="mb-3 text-xs text-blue-600">
            Escanea el QR del brigadista o ingresa el código manualmente. Códigos de prueba: QR-B1-5A-001, QR-B2-5A-002, QR-B4-6A-004
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQrScan()}
              placeholder="Ingresa o escanea el código QR..."
              className="flex-1 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Button onClick={handleQrScan} size="sm">
              Registrar
            </Button>
          </div>
          {qrFeedback && (
            <div
              className={`mt-3 rounded-lg px-4 py-3 text-sm font-medium ${
                qrFeedback.success
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {qrFeedback.message}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 font-medium">Filtrar por grado:</label>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Todos</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              Grado {g}°
            </option>
          ))}
        </select>
      </div>

      {/* Brigadier list */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Lista de brigadistas ({filtered.length})
          </h2>
        </div>
        <div className="divide-y">
          {filtered.map((brigadier) => {
            const record = attendanceMap[brigadier.id];
            return (
              <div
                key={brigadier.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                  {brigadier.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {brigadier.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Grado {brigadier.grade}° {brigadier.section} ·{" "}
                    {brigadier.role === "jefe"
                      ? "Jefe"
                      : brigadier.role === "subjefe"
                      ? "Subjefe"
                      : "Vocal"}
                  </p>
                </div>

                {record?.time && (
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {record.time}
                  </span>
                )}

                {/* Status buttons */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {(["present", "late", "absent", "justified"] as const).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(brigadier.id, s)}
                        title={statusLabels[s]}
                        className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                          record?.status === s
                            ? statusColors[s] + " ring-2 ring-offset-1 ring-current"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {s === "present" ? "✓" : s === "late" ? "⏰" : s === "absent" ? "✗" : "J"}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          {saved ? "✅ Guardado" : "💾 Guardar Asistencia"}
        </Button>
      </div>
    </div>
  );
}
