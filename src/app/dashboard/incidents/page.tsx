"use client";

import { useState } from "react";
import { mockIncidents, mockBrigadiers, type Incident } from "@/lib/mock";
import { Button } from "@/components/ui/button";

const typeLabels: Record<Incident["type"], string> = {
  behavior: "Conducta",
  academic: "Académico",
  health: "Salud",
  safety: "Seguridad",
  other: "Otro",
};

const typeIcons: Record<Incident["type"], string> = {
  behavior: "😤",
  academic: "📚",
  health: "🏥",
  safety: "🛡️",
  other: "📌",
};

const severityLabels: Record<Incident["severity"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const severityColors: Record<Incident["severity"], string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const statusLabels: Record<Incident["status"], string> = {
  open: "Abierto",
  in_progress: "En proceso",
  resolved: "Resuelto",
};

const statusColors: Record<Incident["status"], string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [form, setForm] = useState({
    brigadierId: "",
    type: "behavior" as Incident["type"],
    severity: "low" as Incident["severity"],
    description: "",
  });

  const filtered = incidents.filter(
    (i) => filterStatus === "all" || i.status === filterStatus
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newIncident: Incident = {
      id: `i${Date.now()}`,
      brigadierId: form.brigadierId,
      reportedBy: "u1",
      date: new Date().toISOString().split("T")[0],
      type: form.type,
      severity: form.severity,
      description: form.description,
      status: "open",
    };
    setIncidents((prev) => [newIncident, ...prev]);
    setForm({ brigadierId: "", type: "behavior", severity: "low", description: "" });
    setShowForm(false);
  }

  function resolveIncident(id: string) {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "resolved", resolution: "Resuelto por el docente." } : i
      )
    );
    setSelectedIncident(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Incidentes</h1>
          <p className="text-sm text-gray-500">Registro y seguimiento de incidencias</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "✕ Cancelar" : "+ Nuevo Incidente"}
        </Button>
      </div>

      {/* New Incident Form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">
            Nuevo Incidente
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Brigadista
              </label>
              <select
                value={form.brigadierId}
                onChange={(e) => setForm({ ...form, brigadierId: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Seleccionar brigadista...</option>
                {mockBrigadiers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — Grado {b.grade}° {b.section}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Incident["type"] })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Severidad
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value as Incident["severity"] })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {Object.entries(severityLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={3}
                placeholder="Describe el incidente con detalle..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Registrar Incidente</Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Estado:</label>
        <div className="flex gap-2">
          {["all", "open", "in_progress", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "Todos" : statusLabels[s as Incident["status"]]}
              {s !== "all" && (
                <span className="ml-1">
                  ({incidents.filter((i) => i.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Incident list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-gray-400">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-sm">No hay incidentes en esta categoría</p>
          </div>
        ) : (
          filtered.map((incident) => {
            const brigadier = mockBrigadiers.find((b) => b.id === incident.brigadierId);
            return (
              <div
                key={incident.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() =>
                  setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)
                }
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{typeIcons[incident.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {brigadier?.name ?? "Desconocido"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {typeLabels[incident.type]} · {incident.date}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityColors[incident.severity]}`}
                        >
                          {severityLabels[incident.severity]}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[incident.status]}`}
                        >
                          {statusLabels[incident.status]}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {incident.description}
                    </p>
                  </div>
                </div>

                {selectedIncident?.id === incident.id && (
                  <div className="mt-4 border-t pt-4">
                    {incident.resolution && (
                      <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                        <strong>Resolución:</strong> {incident.resolution}
                      </div>
                    )}
                    {incident.status !== "resolved" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveIncident(incident.id);
                        }}
                        variant="secondary"
                      >
                        ✅ Marcar como resuelto
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
