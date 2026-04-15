import Link from "next/link";

import { HomeRoutesPanel } from "@/components/rebuild/home-routes-panel";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-border bg-surface p-5 shadow-glow">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-accentSoft">
          Etapa 1
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-text">
          Planejamento de rota, antes de qualquer camada social
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          O novo Rota 6 começa pelo essencial: montar origem, destino, paradas e salvar o trajeto de forma confiável no Supabase.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/planejar"
            className="inline-flex h-10 items-center justify-center rounded-[12px] bg-accent px-4 text-sm font-semibold text-background"
          >
            Planejar rota
          </Link>
          <span className="text-xs text-muted">Mapa dominante. Inputs compactos. Salvar sem gambiarra.</span>
        </div>
      </section>

      <section className="rounded-[20px] border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-accentSoft">Home</p>
            <h2 className="mt-2 text-lg font-semibold text-text">Suas rotas recentes</h2>
          </div>
        </div>
        <HomeRoutesPanel />
      </section>
    </div>
  );
}
