"use client";

import { useState } from "react";
import {
  mockBrigadiers,
  mockUsers,
  type Brigadier,
  type User,
} from "@/lib/mock";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [brigadiers, setBrigadiers] = useState<Brigadier[]>(mockBrigadiers);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"brigadiers" | "users">("brigadiers");

  const [form, setForm] = useState({
    name: "",
    grade: "",
    section: "",
    dni: "",
    role: "vocal" as Brigadier["role"],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newBrigadier: Brigadier = {
      id: `b${Date.now()}`,
      name: form.name,
      grade: form.grade,
      section: form.section,
      dni: form.dni,
      qrCode: `QR-NEW-${form.grade}${form.section}-${Date.now()}`,
      role: form.role,
      teacherId: "u1",
      isActive: true,
    };
    setBrigadiers((prev) => [...prev, newBrigadier]);
    setForm({ name: "", grade: "", section: "", dni: "", role: "vocal" });
    setShowForm(false);
  }

  function toggleActive(id: string) {
    setBrigadiers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  }

  const activeBrigadiers = brigadiers.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Administración</h1>
        <p className="text-sm text-gray-500">
          Gestión de brigadistas, usuarios y configuración del sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-blue-50 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{brigadiers.length}</p>
          <p className="text-xs text-gray-500">Total brigadistas</p>
        </div>
        <div className="rounded-2xl bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{activeBrigadiers}</p>
          <p className="text-xs text-gray-500">Activos</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{mockUsers.length}</p>
          <p className="text-xs text-gray-500">Usuarios del sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["brigadiers", "users"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab === "brigadiers" ? "👥 Brigadistas" : "👤 Usuarios"}
          </button>
        ))}
      </div>

      {/* Brigadiers Tab */}
      {activeTab === "brigadiers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Lista de Brigadistas
            </h2>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Cancelar" : "+ Agregar Brigadista"}
            </Button>
          </div>

          {showForm && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-800">
                Nuevo Brigadista
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Ej. Juan Pérez López"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Grado
                    </label>
                    <input
                      type="text"
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      required
                      placeholder="Ej. 5"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Sección
                    </label>
                    <input
                      type="text"
                      value={form.section}
                      onChange={(e) => setForm({ ...form, section: e.target.value })}
                      required
                      placeholder="Ej. A"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      DNI
                    </label>
                    <input
                      type="text"
                      value={form.dni}
                      onChange={(e) => setForm({ ...form, dni: e.target.value })}
                      required
                      placeholder="12345678"
                      maxLength={8}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Rol en la brigada
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as Brigadier["role"] })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="jefe">Jefe de brigada</option>
                      <option value="subjefe">Subjefe de brigada</option>
                      <option value="vocal">Vocal</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar</Button>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Brigadista</th>
                    <th className="px-5 py-3">Grado</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3">Código QR</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {brigadiers.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {b.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{b.name}</p>
                            <p className="text-xs text-gray-400">DNI: {b.dni}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {b.grade}° {b.section}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize">
                          {b.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {b.qrCode}
                        </code>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            b.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {b.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleActive(b.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            b.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {b.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Correo</th>
                  <th className="px-5 py-3">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockUsers.map((u: User) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : u.role === "teacher"
                            ? "bg-green-100 text-green-700"
                            : u.role === "psychologist"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role === "admin"
                          ? "Administrador"
                          : u.role === "teacher"
                          ? "Profesor"
                          : u.role === "psychologist"
                          ? "Psicóloga/o"
                          : "Brigadier"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
