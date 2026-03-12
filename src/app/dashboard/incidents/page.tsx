"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Incident } from "@/lib/types";
import { MOCK_INCIDENTS, MOCK_USERS } from "@/lib/mock-data";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  getSeverityColor,
  getSeverityLabel,
  getIncidentTypeLabel,
  generateId,
} from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "behavioral" as Incident["type"],
  severity: "medium" as Incident["severity"],
  location: "",
  time: new Date().toTimeString().slice(0, 5),
  involvedStudents: [] as string[],
};

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<Incident | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const brigadiers = useMemo(
    () => MOCK_USERS.filter((u) => u.role === "brigadier" && u.active),
    []
  );

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.title.toLowerCase().includes(search.toLowerCase()) ||
        inc.description.toLowerCase().includes(search.toLowerCase()) ||
        inc.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || inc.status === filterStatus;
      const matchesSeverity =
        filterSeverity === "all" || inc.severity === filterSeverity;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [incidents, search, filterStatus, filterSeverity]);

  const today = new Date().toISOString().split("T")[0];

  function handleCreate() {
    if (!form.title.trim() || !form.description.trim()) return;
    const newIncident: Incident = {
      id: generateId("inc"),
      ...form,
      reportedBy: user?.name ?? "Sistema",
      date: today,
      status: "open",
      createdAt: today,
    };
    setIncidents((prev) => [newIncident, ...prev]);
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  function updateStatus(id: string, status: Incident["status"], resolution?: string) {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, status, resolution: resolution ?? inc.resolution } : inc
      )
    );
    setDetailModal((prev) =>
      prev?.id === id ? { ...prev, status, resolution: resolution ?? prev.resolution } : prev
    );
  }

  function toggleStudent(id: string) {
    setForm((f) => ({
      ...f,
      involvedStudents: f.involvedStudents.includes(id)
        ? f.involvedStudents.filter((s) => s !== id)
        : [...f.involvedStudents, id],
    }));
  }

  const statusCounts = useMemo(() => {
    return {
      open: incidents.filter((i) => i.status === "open").length,
      in_progress: incidents.filter((i) => i.status === "in_progress").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
      closed: incidents.filter((i) => i.status === "closed").length,
    };
  }, [incidents]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar incidente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm text-slate-700 bg-transparent focus:outline-none"
            >
              <option value="all">Estado</option>
              <option value="open">Abierto</option>
              <option value="in_progress">En progreso</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none"
          >
            <option value="all">Gravedad</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          <button
            onClick={() => {
              setForm(EMPTY_FORM);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Reportar</span>
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Abiertos", value: statusCounts.open, color: "text-red-700 bg-red-50" },
          { label: "En progreso", value: statusCounts.in_progress, color: "text-yellow-700 bg-yellow-50" },
          { label: "Resueltos", value: statusCounts.resolved, color: "text-green-700 bg-green-50" },
          { label: "Cerrados", value: statusCounts.closed, color: "text-slate-700 bg-slate-50" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm"
          >
            <p className={`text-xl font-bold ${s.color.split(" ")[0]}`}>
              {s.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Incidents list */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setDetailModal(inc)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(
                      inc.severity
                    )}`}
                  >
                    {getSeverityLabel(inc.severity)}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5">
                    {getIncidentTypeLabel(inc.type)}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  {inc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {inc.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{formatDate(inc.date)} {inc.time}</span>
                  <span>·</span>
                  <span>{inc.location}</span>
                  <span>·</span>
                  <span>Por: {inc.reportedBy}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                    inc.status,
                    "incident"
                  )}`}
                >
                  {getStatusLabel(inc.status, "incident")}
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
            <AlertTriangle size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-medium text-slate-400">
              No se encontraron incidentes
            </p>
          </div>
        )}
      </div>

      {/* Create incident modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Reportar Incidente"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Título *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Descripción breve del incidente"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Descripción detallada *
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              placeholder="Describe lo ocurrido con detalle..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tipo
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as Incident["type"],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="behavioral">Conductual</option>
                <option value="medical">Médico</option>
                <option value="safety">Seguridad</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Gravedad
              </label>
              <select
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    severity: e.target.value as Incident["severity"],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ubicación *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Ej: Patio central"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
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
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Brigadistas involucrados (opcional)
            </label>
            <div className="max-h-32 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
              {brigadiers.map((b) => (
                <label
                  key={b.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={form.involvedStudents.includes(b.id)}
                    onChange={() => toggleStudent(b.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-700">
                    {b.name} – {b.grade} {b.section}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={!form.title.trim() || !form.description.trim() || !form.location.trim()}
              className="flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reportar incidente
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      {detailModal && (
        <Modal
          isOpen={!!detailModal}
          onClose={() => setDetailModal(null)}
          title="Detalle del Incidente"
          size="lg"
        >
          <IncidentDetail
            incident={detailModal}
            brigadiers={brigadiers}
            onUpdateStatus={updateStatus}
          />
        </Modal>
      )}
    </div>
  );
}

function IncidentDetail({
  incident,
  brigadiers,
  onUpdateStatus,
}: {
  incident: Incident;
  brigadiers: ReturnType<typeof MOCK_USERS.filter>;
  onUpdateStatus: (id: string, status: Incident["status"], resolution?: string) => void;
}) {
  const [resolution, setResolution] = useState(incident.resolution ?? "");

  const involvedNames = incident.involvedStudents
    .map((id) => brigadiers.find((b) => b.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(incident.severity)}`}>
          {getSeverityLabel(incident.severity)}
        </span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
          {getIncidentTypeLabel(incident.type)}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(incident.status, "incident")}`}>
          {getStatusLabel(incident.status, "incident")}
        </span>
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">{incident.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{incident.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">Fecha y hora</p>
          <p className="font-medium text-slate-700">{formatDate(incident.date)} {incident.time}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Ubicación</p>
          <p className="font-medium text-slate-700">{incident.location}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Reportado por</p>
          <p className="font-medium text-slate-700">{incident.reportedBy}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Involucrados</p>
          <p className="font-medium text-slate-700">{involvedNames || "Ninguno"}</p>
        </div>
      </div>

      {incident.status !== "closed" && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Resolución / Acciones tomadas
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={2}
              placeholder="Describe las acciones tomadas..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {incident.status === "open" && (
              <button
                onClick={() => onUpdateStatus(incident.id, "in_progress", resolution)}
                className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
              >
                Marcar en progreso
              </button>
            )}
            {(incident.status === "open" || incident.status === "in_progress") && (
              <button
                onClick={() => onUpdateStatus(incident.id, "resolved", resolution)}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Marcar resuelto
              </button>
            )}
            {incident.status === "resolved" && (
              <button
                onClick={() => onUpdateStatus(incident.id, "closed", resolution)}
                className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Cerrar incidente
              </button>
            )}
          </div>
        </div>
      )}

      {incident.resolution && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Resolución</p>
          <p className="text-sm text-green-800">{incident.resolution}</p>
        </div>
      )}
    </div>
  );
}
