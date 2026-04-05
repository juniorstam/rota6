"use client";

import Link from "next/link";
import { Compass, Map, ShieldCheck, UserCircle2 } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.2),rgba(245,158,11,0.06))] text-accent shadow-[0_12px_30px_rgba(245,158,11,0.12)]">
            <Map size={20} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-accentSoft">Rota 6</p>
            <p className="text-xs text-muted">Seu radar de estrada para viajar melhor de moto</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <Link href="/">Início</Link>
          <Link href="/explorar">Explorar</Link>
          <Link href="/pessoas">Pessoas</Link>
          <Link href="/planejar">Planejar</Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link href="/admin">Admin</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/planejar"
            className="hidden rounded-full border border-accent/40 bg-accent px-4 py-2 text-sm font-semibold text-background md:inline-flex"
          >
            Abrir planejador
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href={`/perfil/${user.username}`}
                className="rounded-full border border-border px-3 py-2 text-sm text-text"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-border px-3 py-2 text-sm text-muted transition hover:text-text"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full border border-border px-4 py-2 text-sm text-text md:inline-flex"
            >
              Entrar
            </Link>
          )}

          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted md:hidden">
            {user ? <UserCircle2 size={18} /> : <Compass size={18} />}
          </div>
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl px-4 pb-3 text-xs text-muted md:flex md:items-center md:gap-5 md:px-6">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck size={14} />
          recomendações feitas por quem realmente roda
        </span>
        <span>rota, apoio na estrada e inteligência coletiva no mesmo lugar</span>
      </div>
    </header>
  );
}
