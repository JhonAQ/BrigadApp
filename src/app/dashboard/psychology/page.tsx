"use client";

import { useState } from "react";
import {
  mockPsychologySessions,
  mockBrigadiers,
  type PsychologySession,
} from "@/lib/mock";
import { Button } from "@/components/ui/button";

const typeLabels: Record<PsychologySession["type"], string> = {
  individual: "Individual",
  group: "Grupal",
  family: "Familiar",
};

const typeColors: Record<PsychologySession["type"], string> = {
  individual: "bg-blue-100 text-blue-700",
  group: "bg-purple-100 text-purple-700",
  family: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<PsychologySession["status"], string> = {
  scheduled: "Programada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusColors: Record<PsychologySession["status"], string> = {
  scheduled: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function PsychologyPage() {
  const [sessions, setSessions] = useState<PsychologySession[]>(
    mockPsychologySessions
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    date: "",
    type: "individual" as PsychologySession["type"],
    notes: "",
    followUp: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newSession: PsychologySession = {
      id: `ps${Date.now()}`,
      studentId: form.studentId,
      psychologistId: "u3",
      date: form.date,
      type: form.type,
      notes: form.notes,
      followUp: form.followUp || undefined,
      status: "scheduled",
    };
    setSessions((prev) => [newSession, ...prev]);
    setForm({ studentId: "", date: "", type: "individual", notes: "", followUp: "" });
    setShowForm(false);
  }

  function completeSession(id: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "completed" } : s))
    );
  }

  const stats = {
    total: sessions.length,
    scheduled: sessions.filter((s) => s.status === "scheduled").length,
    completed: sessions.filter((s) => s.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Psicología</h1>
          <p className="text-sm text-gray-500">
            Gestión de sesiones y seguimiento psicológico
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "✕ Cancelar" : "+ Nueva Sesión"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total sesiones", count: stats.total, color: "bg-gray-50" },
          { label: "Programadas", count: stats.scheduled, color: "bg-yellow-50" },
          { label: "Completadas", count: stats.completed, color: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold text-gray-900">{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* New Session Form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Programar Nueva Sesión
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Estudiante
                </label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {mockBrigadiers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo de sesión
              </label>
              <div className="flex gap-3">
                {(["individual", "group", "family"] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                      form.type === t
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={form.type === t}
                      onChange={() => setForm({ ...form, type: t })}
                      className="hidden"
                    />
                    {typeLabels[t]}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notas de la sesión
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                required
                rows={3}
                placeholder="Observaciones y descripción de la sesión..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Seguimiento (opcional)
              </label>
              <input
                type="text"
                value={form.followUp}
                onChange={(e) => setForm({ ...form, followUp: e.target.value })}
                placeholder="Plan de seguimiento..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">Programar Sesión</Button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Historial de sesiones
        </h2>
        {sessions.map((session) => {
          const student = mockBrigadiers.find((b) => b.id === session.studentId);
          return (
            <div
              key={session.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                    {student?.name.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {student?.name ?? "Estudiante desconocido"}
                    </p>
                    <p className="text-xs text-gray-400">{session.date}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${typeColors[session.type]}`}
                  >
                    {typeLabels[session.type]}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[session.status]}`}
                  >
                    {statusLabels[session.status]}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
                  <strong className="text-gray-700">Notas:</strong> {session.notes}
                </div>
                {session.followUp && (
                  <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-sm text-blue-700">
                    <strong>Seguimiento:</strong> {session.followUp}
                  </div>
                )}
              </div>

              {session.status === "scheduled" && (
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => completeSession(session.id)}
                  >
                    ✅ Marcar como completada
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
