"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  BadgeCheck,
  Download,
  Plus,
  Search,
  Settings,
  Trash2,
  UserPlus,
  X,
  Edit,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"USERS" | "STUDENTS">("USERS");
  const [userFilter, setUserFilter] = useState<
    "ALL" | "BRIGADIER" | "PSYCHOLOGIST"
  >("ALL");
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    role: "BRIGADIER_AULA",
    password: "",
    grade: "",
    section: "",
  });

  // Fetch from DB
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
    if (error) toast.error("Error cargando usuarios: " + error.message);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      dni: "",
      role: "BRIGADIER_AULA",
      password: "",
      grade: "",
      section: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setFormData({
      name: user.name || "",
      dni: user.dni || "",
      role: user.role || "BRIGADIER_AULA",
      password: user.password || "",
      grade: user.grade || "",
      section: user.section || "",
    });
    setIsEditing(true);
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      // If not a brigadier that needs grade/section, clear them
      if (
        !payload.role.includes("BRIGADIER_AULA") &&
        !payload.role.includes("BRIGADIER_PATRULLA")
      ) {
        payload.grade = null;
        payload.section = null;
      }

      if (isEditing && editingId) {
        const { error } = await supabase
          .from("users")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Usuario actualizado correctamente");
      } else {
        const { error } = await supabase.from("users").insert(payload);
        if (error) throw error;
        toast.success("Usuario creado correctamente");
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error("Error al guardar usuario: " + error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Eliminar usuario?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      toast.success("Usuario eliminado");
      fetchUsers();
    }
  };

  const handlePreviewCarnet = (user: any) => {
    toast.info(`Vista previa de carnet para ${user.name} (Próximamente)`);
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Carnets Digitales - Brigadieres", 20, 20);

    let y = 40;
    users
      .filter((u) => u.role?.includes("BRIGADIER"))
      .forEach((user, i) => {
        doc.setFontSize(14);
        doc.text(`Nombre: ${user.name}`, 20, y);
        doc.setFontSize(10);
        doc.text(`Rol: ${user.role.replace(/_/g, " ")}`, 20, y + 6);
        if (user.grade && user.section) {
          doc.text(`Salón: ${user.grade}° ${user.section}`, 20, y + 12);
        }
        doc.rect(15, y - 5, 180, 22);
        y += 30;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

    doc.save("carnets-brigadieres.pdf");
    toast.success("Descarga iniciada");
  };

  const filteredUsers = users.filter((u) => {
    if (userFilter === "ALL") return true;
    if (userFilter === "BRIGADIER") return u.role?.includes("BRIGADIER");
    return u.role === "PSYCHOLOGIST";
  });

  const requiresClassroom =
    formData.role === "BRIGADIER_AULA" ||
    formData.role === "BRIGADIER_PATRULLA";

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Administración
          </h1>
          <p className="text-slate-500 text-sm">
            Control total de usuarios y privilegios.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab("USERS")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "USERS" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab("STUDENTS")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "STUDENTS" ? "bg-white shadow text-slate-800" : "text-slate-500"}`}
          >
            Estudiantes / Carnets
          </button>
        </div>
      </div>

      {activeTab === "USERS" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {["ALL", "BRIGADIER", "PSYCHOLOGIST"].map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${userFilter === f ? "bg-indigo-600 border-indigo-600 text-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {f === "ALL"
                    ? "Todos"
                    : f === "BRIGADIER"
                      ? "Brigadieres"
                      : "Psicólogos"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap min-w-max">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">DNI / User</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Ubicación</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-bold text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                          {user.name?.charAt(0) || "?"}
                        </div>
                        <div className="truncate max-w-[150px] sm:max-w-full">
                          {user.name}
                          <div className="text-xs text-slate-400 font-normal sm:hidden">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-mono">
                      {user.dni}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs font-semibold">
                      {user.grade && user.section
                        ? `${user.grade}° ${user.section}`
                        : "-"}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        {user.role?.includes("BRIGADIER") && (
                          <button
                            onClick={() => handlePreviewCarnet(user)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-2"
                            title="Ver Carnet"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-2"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "STUDENTS" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="max-w-md mx-auto">
            <BadgeCheck className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Generación de Carnets
            </h2>
            <p className="text-slate-500 mb-6">
              Genera y descarga los carnets digitales para todos los brigadieres
              activos en formato PDF.
            </p>

            <Button
              onClick={handleDownloadPDF}
              className="bg-indigo-600 hover:bg-indigo-700 w-full shadow-lg shadow-indigo-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Carnets Masivos (PDF)
            </Button>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR USUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveUser}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  DNI (Usuario)
                </label>
                <input
                  required
                  type="text"
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  Contraseña
                </label>
                <input
                  required
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  Rol en el Sistema
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900"
                >
                  <option value="BRIGADIER_AULA">Brigadier de Aula</option>
                  <option value="BRIGADIER_PATRULLA">
                    Brigadier de Patrulla
                  </option>
                  <option value="BRIGADIER_GENERAL_ALTERNO">
                    Brigadier General Alterno
                  </option>
                  <option value="BRIGADIER_GENERAL_PRINCIPAL">
                    Brigadier General Principal
                  </option>
                  <option value="DOCENTE">Docente / Administrador</option>
                  <option value="PSYCHOLOGIST">Psicólogo</option>
                </select>
              </div>

              {/* Secciones y Grados solo para brigadieres de aula/patrulla */}
              {requiresClassroom && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      Grado
                    </label>
                    <select
                      required
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900"
                      value={formData.grade}
                      onChange={(e) =>
                        setFormData({ ...formData, grade: e.target.value })
                      }
                    >
                      <option value="">Seleccionar</option>
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      Sección
                    </label>
                    <select
                      required
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                    >
                      <option value="">Seleccionar</option>
                      {["A", "B", "C", "D", "E", "F"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                >
                  {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
