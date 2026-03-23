"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, Lock, User as UserIcon, LogOut, Check, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Assuming we might switch to shadcn later, but for now I'll use a custom Modal wrapper or just inline it if I can't reuse the Modal component effectively. actually I created Modal component.
import { Modal } from "@/components/ui/modal";

interface UserProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDialog({ isOpen, onClose }: UserProfileDialogProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // First verify current password (in a real app this should be done on server side or via dedicated auth endpoint)
      // Since we are using a simple users table:
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("password")
        .eq("id", user.id)
        .single();

      if (fetchError || !userData) {
        throw new Error("Error al verificar usuario");
      }

      if (userData.password !== currentPassword) {
        toast.error("La contraseña actual es incorrecta");
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: newPassword })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Contraseña actualizada exitosamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActiveTab("profile"); // Go back to profile or close?
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        } m-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative h-32">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="absolute -bottom-10 left-6 flex items-end">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg">
              <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-2xl font-bold text-white">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="mb-2 ml-3">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-slate-300 text-sm">{user.role.replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 px-6 pb-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "profile" 
                  ? "text-indigo-600" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Perfil
              {activeTab === "profile" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
                activeTab === "security" 
                  ? "text-indigo-600" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Seguridad
              {activeTab === "security" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          </div>

          {activeTab === "profile" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">DNI</p>
                  <p className="text-slate-900 font-medium mt-1">{user.dni}</p>
                </div>
                {user.grade && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Grado</p>
                    <p className="text-slate-900 font-medium mt-1">{user.grade}</p>
                  </div>
                )}
                {user.section && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Sección</p>
                    <p className="text-slate-900 font-medium mt-1">{user.section}</p>
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Rol</p>
                  <p className="text-slate-900 font-medium mt-1 text-xs truncate">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors group"
                >
                  <span className="font-medium flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Contraseña Actual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Ingresa tu contraseña actual"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}