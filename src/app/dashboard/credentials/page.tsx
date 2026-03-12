"use client";

import { useState, useMemo, useRef } from "react";
import { MOCK_USERS } from "@/lib/mock-data";
import { User } from "@/lib/types";
import { getInitials, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Search, Printer, Download, CreditCard, Eye } from "lucide-react";
import QRCodeCanvas from "@/components/credentials/QRCodeCanvas";

export default function CredentialsPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const brigadiers = useMemo(
    () =>
      MOCK_USERS.filter(
        (u) =>
          u.role === "brigadier" &&
          u.active &&
          (u.name.toLowerCase().includes(search.toLowerCase()) ||
            (u.studentCode ?? "").includes(search) ||
            (u.grade ?? "").includes(search))
      ),
    [search]
  );

  function openPreview(u: User) {
    setSelectedUser(u);
    setPreviewOpen(true);
  }

  function handlePrint() {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Credencial – ${selectedUser?.name}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; background: white; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Buscar brigadista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <p className="text-sm text-slate-500">
        {brigadiers.length} brigadista{brigadiers.length !== 1 ? "s" : ""} con credencial disponible
      </p>

      {/* Credentials grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brigadiers.map((u) => (
          <CredentialCard key={u.id} user={u} onPreview={() => openPreview(u)} />
        ))}
        {brigadiers.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <CreditCard size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-medium text-slate-400">
              No se encontraron brigadistas
            </p>
          </div>
        )}
      </div>

      {/* Preview modal */}
      <Modal
        isOpen={previewOpen && !!selectedUser}
        onClose={() => setPreviewOpen(false)}
        title="Credencial del Brigadista"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div ref={printRef}>
              <CredentialFull user={selectedUser} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Printer size={16} />
                Imprimir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CredentialCard({ user, onPreview }: { user: User; onPreview: () => void }) {
  return (
    <div className="group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
          {getInitials(user.name)}
        </div>
        <button
          onClick={onPreview}
          className="rounded-xl p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"
          title="Ver credencial"
        >
          <Eye size={16} />
        </button>
      </div>
      <p className="font-semibold text-slate-900 text-sm leading-tight">{user.name}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {user.grade} {user.section}
      </p>
      <p className="text-xs font-mono text-slate-400 mt-1">
        {user.studentCode ?? "—"}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-10 w-10">
          <QRCodeCanvas value={`BRIG:${user.studentCode ?? user.id}`} size={40} />
        </div>
        <button
          onClick={onPreview}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <Download size={12} />
          Ver
        </button>
      </div>
    </div>
  );
}

function CredentialFull({ user }: { user: User }) {
  const issueDate = formatDate(new Date().toISOString().split("T")[0]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "320px",
        margin: "0 auto",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
          padding: "20px 20px 16px",
          color: "white",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.8, margin: 0 }}>
          BRIGADAS ESCOLARES
        </p>
        <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0 0" }}>
          BrigadApp
        </h2>
        <p style={{ fontSize: "11px", opacity: 0.7, margin: "2px 0 0" }}>
          Credencial Oficial
        </p>
      </div>

      {/* Body */}
      <div style={{ background: "white", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#1d4ed8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", margin: 0 }}>
              {user.name}
            </p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
              Brigadista Escolar
            </p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
              {user.grade} &quot;{user.section}&quot;
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Código</span>
            <span style={{ fontSize: "12px", fontWeight: 600, fontFamily: "monospace", color: "#0f172a" }}>
              {user.studentCode ?? user.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Emisión</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
              {issueDate}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "8px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "white" }}>
            <QRCodeCanvas
              value={`BRIG:${user.studentCode ?? user.id}:${user.name}`}
              size={100}
            />
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "10px", color: "#94a3b8", marginTop: "8px", marginBottom: 0 }}>
          Escanea para verificar asistencia
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          background: "#1d4ed8",
          padding: "8px 16px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", margin: 0, letterSpacing: "1px" }}>
          VÁLIDO AÑO ESCOLAR 2024
        </p>
      </div>
    </div>
  );
}
