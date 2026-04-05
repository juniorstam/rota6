"use client";

import Link from "next/link";
import { Map } from "lucide-react";

import { AvatarMenu } from "@/components/avatar-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.2),rgba(245,158,11,0.06))] text-accent shadow-[0_12px_30px_rgba(245,158,11,0.12)]">
            <Map size={20} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-accentSoft">Rota 6</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <Link href="/">Início</Link>
          <Link href="/explorar">Explorar</Link>
          <Link href="/bikers">Bikers</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/planejar"
            className="hidden rounded-full border border-accent/40 bg-accent px-4 py-2 text-sm font-semibold text-background md:inline-flex"
          >
            Planejar viagens
          </Link>

          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}
