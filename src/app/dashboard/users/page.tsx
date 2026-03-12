"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mock-data";
import {
  getRoleLabel,
  getRoleBadgeClass,
  getInitials,
  generateId,
  formatDate,
} from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  Users,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "brigadier" as User["role"],
  grade: "",
  section: "",
  studentCode: "",
  active: true,
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const isAdmin = currentUser?.role === "admin";

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.studentCode ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesRole = filterRole === "all" || u.role === filterRole;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" ? u.active : !u.active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  function openCreate() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      grade: u.grade ?? "",
      section: u.section ?? "",
      studentCode: u.studentCode ?? "",
      active: u.active,
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                ...form,
                grade: form.grade || undefined,
                section: form.section || undefined,
                studentCode: form.studentCode || undefined,
              }
            : u
        )
      );
    } else {
      const newUser: User = {
        id: generateId("usr"),
        ...form,
        grade: form.grade || undefined,
        section: form.section || undefined,
        studentCode: form.studentCode || undefined,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirm(null);
  }

  function toggleStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  }

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
            placeholder="Buscar brigadista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-sm text-slate-700 bg-transparent focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="admin">Admin</option>
              <option value="coordinator">Coordinador</option>
              <option value="brigadier">Brigadista</option>
            </select>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Estado: Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-500">
        Mostrando {filtered.length} de {users.length} usuarios
      </p>

      {/* Table (desktop) / Cards (mobile) */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rol
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Grado / Sección
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Código
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>
                {isAdmin && (
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                        u.role
                      )}`}
                    >
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {u.grade && u.section
                      ? `${u.grade} ${u.section}`
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-600 text-xs">
                    {u.studentCode ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.active
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleStatus(u.id)}
                          title={u.active ? "Desactivar" : "Activar"}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                          {u.active ? (
                            <UserX size={15} />
                          ) : (
                            <UserCheck size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(u.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Users size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="font-medium">No se encontraron usuarios</p>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filtered.map((u) => (
            <div key={u.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {getInitials(u.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                          u.role
                        )}`}
                      >
                        {getRoleLabel(u.role)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(u)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(u.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              {(u.grade || u.studentCode) && (
                <div className="mt-2 flex items-center gap-3 pl-13 text-xs text-slate-400">
                  {u.grade && (
                    <span>
                      {u.grade} {u.section}
                    </span>
                  )}
                  {u.studentCode && <span>Cód: {u.studentCode}</span>}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="font-medium">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre completo *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Nombre Apellido"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="correo@brigadapp.edu"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Rol *
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as User["role"],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="brigadier">Brigadista</option>
                <option value="coordinator">Coordinador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Estado
              </label>
              <select
                value={form.active ? "active" : "inactive"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    active: e.target.value === "active",
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            {form.role === "brigadier" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Grado
                  </label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, grade: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="5°"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Sección
                  </label>
                  <input
                    type="text"
                    value={form.section}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, section: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="A"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Código de estudiante
                  </label>
                  <input
                    type="text"
                    value={form.studentCode}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        studentCode: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="2024-009"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.email.trim() || !form.password.trim()}
              className="flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingUser ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar eliminación"
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-5">
          ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se
          puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}

