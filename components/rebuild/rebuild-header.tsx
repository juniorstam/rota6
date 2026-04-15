"use client";

import Link from "next/link";
import { Map, Route, UserCircle2 } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";

export function RebuildHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mobile-frame flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-accent/30 bg-surface text-accent">
            <Map size={18} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-accentSoft">Rota 6</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="rounded-[10px] px-3 py-2 transition hover:bg-surface hover:text-text">
            Home
          </Link>
          <Link
            href="/planejar"
            className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-3 py-2 font-medium text-background"
          >
            <Route size={15} />
            Planejar
          </Link>
          {loading ? null : user ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text"
              title="Sair"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">{user.name.slice(0, 1).toUpperCase()}</span>
              )}
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text"
              title="Entrar"
            >
              <UserCircle2 size={18} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
