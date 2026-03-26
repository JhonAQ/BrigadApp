"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Section {
  id: string;
  grade: string;
  name: string;
  capacity?: number;
}

export default function SectionsPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    grade: "",
    name: "",
    capacity: 30,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  async function fetchSections() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("grade", { ascending: true });
      if (error) throw error;
      setSections(data || []);
    } catch (error: any) {
      console.error("Error fetching sections:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Remover capacity ya que no existe en la base de datos de momento
      const payload = { grade: formData.grade, name: formData.name };

      if (editingId) {
        const { error } = await supabase
          .from("sections")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sections").insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      setFormData({ grade: "", name: "", capacity: 30 });
      setEditingId(null);
      fetchSections();
    } catch (error: any) {
      console.error("Error saving section:", error.message);
      alert("Error al guardar la sección: " + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "¿Está seguro de eliminar esta sección? Esto podría afectar a los estudiantes asignados a la misma.",
      )
    )
      return;
    try {
      const { error } = await supabase.from("sections").delete().eq("id", id);
      if (error) throw error;
      fetchSections();
    } catch (error: any) {
      console.error("Error deleting section:", error.message);
      alert("Error al eliminar la sección.");
    }
  }

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center">Cargando...</div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Grados y Secciones
          </h1>
          <p className="text-slate-600 mt-2">
            Configura la estructura académica
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Sección
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-700">Grado</th>
              <th className="p-4 font-semibold text-slate-700">Sección</th>
              <th className="p-4 font-semibold text-slate-700">Capacidad</th>
              <th className="p-4 font-semibold text-slate-700 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sections.map((section) => (
              <tr key={section.id} className="hover:bg-slate-50">
                <td className="p-4 text-slate-900">{section.grade}</td>
                <td className="p-4 text-slate-900">{section.name}</td>
                <td className="p-4 text-slate-600">
                  {section.capacity || "N/A"}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setFormData({
                        grade: section.grade,
                        name: section.name,
                        capacity: section.capacity || 30,
                      });
                      setEditingId(section.id);
                      setShowModal(true);
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No hay secciones configuradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Editar Sección" : "Nueva Sección"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
              <div>
                <label className="block text-sm font-medium mb-1">Grado</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: 1er Año"
                  className="w-full p-2 border rounded-md"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sección / Nombre
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: A"
                  className="w-full p-2 border rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacidad Típica
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
