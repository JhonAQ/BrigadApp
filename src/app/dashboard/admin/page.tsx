"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Shield,
  Plus,
  Edit2,
  Key,
  CheckCircle2,
  UserCog,
  User,
  LayoutGrid,
  Trash2,
  Printer,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [dbSections, setDbSections] = useState<any[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "admins" | "brigadiers" | "credentials"
  >("admins");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Credentials state
  const [selectedForPrint, setSelectedForPrint] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    dni: "",
    password: "",
    name: "",
    role: "BRIGADIER_AULA",
    grade: "",
    section: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchSections();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setUsers(data);
    setIsLoading(false);
  };

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .order("grade", { ascending: true })
      .order("name", { ascending: true });

    if (data) {
      setDbSections(data);
      const gradesSet = new Set(data.map((s: any) => s.grade));
      setAvailableGrades(Array.from(gradesSet) as string[]);
    }
  };

  const openCreateModal = () => {
    const generatedPassword = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    setFormData({
      dni: "",
      password: generatedPassword,
      name: "",
      role: "BRIGADIER_AULA",
      grade: "",
      section: "",
    });
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (userPayload: any) => {
    setFormData({
      dni: userPayload.dni || "",
      password: userPayload.password || "",
      name: userPayload.name,
      role: userPayload.role,
      grade: userPayload.grade || "",
      section: userPayload.section || "",
    });
    setIsEditing(true);
    setEditingId(userPayload.id);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userToDelete: any) => {
    if (
      !confirm(
        `¿Estás seguro que deseas ELIMINAR permanentemente a ${userToDelete.name} (${userToDelete.id})?`,
      )
    )
      return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userToDelete.id);
    if (error) {
      alert("Error eliminando usuario: " + error.message);
    } else {
      fetchUsers();
    }
  };

  const handleSaveUser = async () => {
    if (!formData.dni || !formData.name || !formData.role)
      return alert("Completa los campos base");

    if (requiresClassroom && (!formData.grade || !formData.section)) {
      return alert(
        "Si el rol es Brigadier de Aula o Patrulla, debes asignar grado y sección obligatoriamente.",
      );
    }

    const payload = {
      dni: formData.dni,
      password: formData.password,
      name: formData.name,
      role: formData.role,
      grade: requiresClassroom ? formData.grade : null,
      section: requiresClassroom ? formData.section : null,
    };

    if (isEditing && editingId) {
      const { error } = await supabase
        .from("users")
        .update(payload)
        .eq("id", editingId);
      if (error) return alert("Error actualizando usuario: " + error.message);
    } else {
      const { error } = await supabase.from("users").insert([payload]);
      if (error)
        return alert(
          "Error creando usuario. Quizá el DNI ya existe: " + error.message,
        );
    }

    setIsModalOpen(false);
    fetchUsers();
  };

  const handleTogglePrintSelection = (id: string) => {
    setSelectedForPrint((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const requiresClassroom =
    formData.role === "BRIGADIER_AULA" ||
    formData.role === "BRIGADIER_PATRULLA";

  const admins = users.filter(
    (u) =>
      u.role === "DEVELOPER" ||
      u.role === "DOCENTE" ||
      u.role?.includes("BRIGADIER_GENERAL") ||
      u.role === "PSYCHOLOGIST",
  );
  const brigadiersAula = users.filter((u) => u.role === "BRIGADIER_AULA");
  const brigadiersPatrulla = users.filter(
    (u) => u.role === "BRIGADIER_PATRULLA",
  );
  const allBrigadiers = [
    ...brigadiersAula,
    ...brigadiersPatrulla,
    ...users.filter((u) => u.role?.includes("GENERAL")),
  ];

  if (
    user?.role !== "DEVELOPER" &&
    user?.role !== "DOCENTE" &&
    !user?.role?.includes("BRIGADIER_GENERAL")
  ) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-red-500 font-bold">
          No tienes permisos para ver esta página.
        </p>
      </div>
    );
  }

  const usersList = (list: any[], mode: "list" | "select" = "list") => {
    if (list.length === 0)
      return (
        <div className="py-8 text-center text-slate-400">
          No hay usuarios aquí.
        </div>
      );

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                {mode === "select" && <th className="p-4 w-12"></th>}
                <th className="p-4 whitespace-nowrap">Usuario</th>
                <th className="p-4 whitespace-nowrap">Rol</th>
                <th className="p-4 whitespace-nowrap">Asignación</th>
                {mode === "list" && (
                  <th className="p-4 whitespace-nowrap text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-50/50 transition-colors ${selectedForPrint.includes(u.id) ? "bg-indigo-50/30" : ""}`}
                >
                  {mode === "select" && (
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                        checked={selectedForPrint.includes(u.id)}
                        onChange={() => handleTogglePrintSelection(u.id)}
                      />
                    </td>
                  )}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shadow-inner flex-shrink-0">
                        {u.name.charAt(0)}
                        {u.name.split(" ")[1]?.[0] || ""}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm whitespace-nowrap">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Doc/Usuario: {u.dni || u.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${
                        u.role === "DOCENTE" || u.role === "PSYCHOLOGIST"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : u.role.includes("GENERAL")
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {u.role === "DOCENTE" ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.grade && u.section ? (
                      <span className="inline-flex font-medium text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap">
                        {u.grade} - {u.section}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Sin Asignación
                      </span>
                    )}
                  </td>
                  {mode === "list" && (
                    <td className="p-4 flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-7 h-7 text-indigo-500" /> Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Agrega, edita, elimina usuarios y genera sus credenciales.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </header>

      <div className="flex gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto whitespace-nowrap max-w-fit">
        <button
          onClick={() => setActiveTab("admins")}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "admins"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Administrativos
        </button>
        <button
          onClick={() => setActiveTab("brigadiers")}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "brigadiers"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Brigadieres Operativos
        </button>
        <button
          onClick={() => setActiveTab("credentials")}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "credentials"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Printer className="w-4 h-4" /> Carnets y Códigos QR
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="mt-2">
          {activeTab === "admins" && (
            <div className="space-y-4">{usersList(admins)}</div>
          )}

          {activeTab === "brigadiers" && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Brigadieres de Aula
                  </h3>
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-md">
                    {brigadiersAula.length}
                  </span>
                </div>
                {usersList(brigadiersAula)}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                  <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Brigadieres de Patrulla
                  </h3>
                  <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-md">
                    {brigadiersPatrulla.length}
                  </span>
                </div>
                {usersList(brigadiersPatrulla)}
              </div>
            </div>
          )}

          {activeTab === "credentials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Generador de Identificaciones
                  </h3>
                  <p className="text-sm text-slate-500">
                    Selecciona los brigadieres que necesitan carnet impreso.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setSelectedForPrint(allBrigadiers.map((b) => b.id))
                    }
                    className="text-sm font-semibold text-slate-600 border border-slate-200 bg-white px-4 py-2 rounded-lg"
                  >
                    Marcar Todos
                  </button>
                  <Link
                    href={`/print/credentials?ids=${selectedForPrint.join(",")}`}
                  >
                    <button
                      disabled={selectedForPrint.length === 0}
                      className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> Imprimir{" "}
                      {selectedForPrint.length} Carnets PDF
                    </button>
                  </Link>
                </div>
              </div>
              {usersList(allBrigadiers, "select")}
            </div>
          )}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  {isEditing ? (
                    <Edit2 className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <Plus className="w-5 h-5 text-indigo-500" />
                  )}
                  {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3 h-3" /> Documento ID / Correo / Usuario
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                    placeholder="Ej. 70123456 o usuario@escuela.edu"
                    value={formData.dni}
                    disabled={isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                  />
                  {isEditing && (
                    <p className="text-[10px] text-slate-400">
                      El ID de acceso no se puede modificar.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3 h-3" /> Contraseña
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ej. asdflkjasdflkj"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-slate-500">
                    Por defecto se genera automática de 6 dígitos al crear.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Nombres Completos
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Nombres y Apellidos"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Rol del Usuario
                  </label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value,
                        grade: "",
                        section: "",
                      })
                    }
                  >
                    <optgroup label="Administrativos">
                      <option value="DOCENTE">Docente / Coordinador</option>
                      <option value="PSYCHOLOGIST">Psicología</option>
                      <option value="BRIGADIER_GENERAL_PRINCIPAL">
                        Brigadier General Principal
                      </option>
                      <option value="BRIGADIER_GENERAL_ALTERNO">
                        Brigadier General Alterno
                      </option>
                    </optgroup>
                    <optgroup label="Operativos">
                      <option value="BRIGADIER_PATRULLA">
                        Brigadier de Patrulla
                      </option>
                      <option value="BRIGADIER_AULA">Brigadier de Aula</option>
                    </optgroup>
                  </select>
                </div>

                {requiresClassroom && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <LayoutGrid className="w-3 h-3" /> Grado
                      </label>
                      <select
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.grade}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            grade: e.target.value,
                            section: "",
                          })
                        }
                      >
                        <option value="">Elegir grado...</option>
                        {availableGrades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Sección
                      </label>
                      <select
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
                        value={formData.section}
                        onChange={(e) =>
                          setFormData({ ...formData, section: e.target.value })
                        }
                        disabled={!formData.grade}
                      >
                        <option value="">Elegir sección...</option>
                        {dbSections
                          .filter((s) => s.grade === formData.grade)
                          .map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-200/50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow flex items-center gap-2 transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />{" "}
                  {isEditing ? "Guardar Cambios" : "Registrar"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
