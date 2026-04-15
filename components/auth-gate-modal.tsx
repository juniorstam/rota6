"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { AuthForm } from "@/components/auth-form";

export function AuthGateModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070dcc]/80 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-lg">
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:text-text"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-accent text-background" : "border border-border bg-surface text-muted"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === "signup" ? "bg-accent text-background" : "border border-border bg-surface text-muted"
            }`}
          >
            Criar conta
          </button>
        </div>

        <AuthForm mode={mode} onSuccess={onClose} hideSwitcher />
      </div>
    </div>
  );
}
