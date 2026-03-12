"use client";

import { mockBrigadiers, mockAttendance, mockIncidents, mockPsychologySessions } from "@/lib/mock";

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-gray-600">{pct}%</span>
    </div>
  );
}

export default function ReportsPage() {
  const activeBrigadiers = mockBrigadiers.filter((b) => b.isActive);

  // Attendance stats per brigadier
  const attendanceStats = activeBrigadiers.map((b) => {
    const records = mockAttendance.filter((a) => a.brigadierId === b.id);
    const present = records.filter((r) => r.status === "present").length;
    const late = records.filter((r) => r.status === "late").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const justified = records.filter((r) => r.status === "justified").length;
    return { brigadier: b, present, late, absent, justified, total: records.length };
  });

  // Incident stats
  const incidentsByType = mockIncidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1;
    return acc;
  }, {});

  const incidentsBySeverity = mockIncidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.severity] = (acc[i.severity] ?? 0) + 1;
    return acc;
  }, {});

  // Overall attendance summary
  const totalRecords = mockAttendance.length;
  const totalPresent = mockAttendance.filter((r) => r.status === "present").length;
  const totalLate = mockAttendance.filter((r) => r.status === "late").length;
  const totalAbsent = mockAttendance.filter((r) => r.status === "absent").length;
  const totalJustified = mockAttendance.filter((r) => r.status === "justified").length;

  const typeLabels: Record<string, string> = {
    behavior: "Conducta",
    academic: "Académico",
    health: "Salud",
    safety: "Seguridad",
    other: "Otro",
  };

  const severityLabels: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500">
          Estadísticas y análisis del programa de brigadistas
        </p>
      </div>

      {/* Global summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Brigadistas activos", value: activeBrigadiers.length, icon: "👥", color: "bg-blue-50 text-blue-700" },
          { label: "Registros asistencia", value: totalRecords, icon: "📋", color: "bg-green-50 text-green-700" },
          { label: "Incidentes totales", value: mockIncidents.length, icon: "⚠️", color: "bg-yellow-50 text-yellow-700" },
          { label: "Sesiones psicología", value: mockPsychologySessions.length, icon: "🧠", color: "bg-purple-50 text-purple-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color.split(" ")[0]}`}>
            <div className="mb-1 text-xl">{s.icon}</div>
            <p className={`text-2xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Overview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          📊 Resumen de Asistencia Global
        </h2>
        <div className="space-y-3">
          {[
            { label: "Presentes", count: totalPresent, color: "bg-green-500" },
            { label: "Tardanzas", count: totalLate, color: "bg-yellow-500" },
            { label: "Ausentes", count: totalAbsent, color: "bg-red-500" },
            { label: "Justificados", count: totalJustified, color: "bg-blue-500" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
              <ProgressBar value={item.count} max={totalRecords} color={item.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Per-brigadier attendance */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          👥 Asistencia por Brigadista
        </h2>
        <div className="space-y-3">
          {attendanceStats
            .sort((a, b) => b.present - a.present)
            .map(({ brigadier, present, late, absent, justified, total }) => (
              <div
                key={brigadier.id}
                className="rounded-xl border border-gray-100 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {brigadier.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {brigadier.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {total} registro{total !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "P", count: present, color: "bg-green-100 text-green-700" },
                    { label: "T", count: late, color: "bg-yellow-100 text-yellow-700" },
                    { label: "A", count: absent, color: "bg-red-100 text-red-700" },
                    { label: "J", count: justified, color: "bg-blue-100 text-blue-700" },
                  ].map((s) => (
                    <span
                      key={s.label}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}
                    >
                      {s.label}: {s.count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Incidents breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            ⚠️ Incidentes por Tipo
          </h2>
          <div className="space-y-3">
            {Object.entries(incidentsByType).map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{typeLabels[type] ?? type}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
                <ProgressBar
                  value={count}
                  max={mockIncidents.length}
                  color="bg-orange-400"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            🔴 Incidentes por Severidad
          </h2>
          <div className="space-y-3">
            {Object.entries(incidentsBySeverity).map(([severity, count]) => (
              <div key={severity} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{severityLabels[severity] ?? severity}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
                <ProgressBar
                  value={count}
                  max={mockIncidents.length}
                  color={
                    severity === "high"
                      ? "bg-red-500"
                      : severity === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Psychology Sessions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          🧠 Sesiones de Psicología
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Individuales",
              count: mockPsychologySessions.filter((s) => s.type === "individual").length,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Grupales",
              count: mockPsychologySessions.filter((s) => s.type === "group").length,
              color: "bg-purple-50 text-purple-700",
            },
            {
              label: "Familiares",
              count: mockPsychologySessions.filter((s) => s.type === "family").length,
              color: "bg-orange-50 text-orange-700",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-3 text-center ${s.color.split(" ")[0]}`}>
              <p className={`text-2xl font-bold ${s.color.split(" ")[1]}`}>{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
