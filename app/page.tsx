import Link from "next/link";
import { ArrowRight, Compass, MapPinned, ShieldCheck, Sparkles } from "lucide-react";

import { FilterBar } from "@/components/filter-bar";
import { PlaceCard } from "@/components/place-card";
import { SearchBar } from "@/components/search-bar";
import { TripCard } from "@/components/trip-card";
import { places, trips } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[36px] border border-border bg-hero-grid bg-surface px-5 py-8 shadow-glow md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-accentSoft">
              <Sparkles size={14} />
              planejamento premium para motoviagem
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-text md:text-6xl">
              A estrada fica melhor quando a rota, as paradas e as dicas certas estão no mesmo painel.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
              Rota 6 foi desenhada para ser o radar de viagem do motociclista: mapa em destaque, pontos confiáveis,
              alertas úteis e roteiros compartilhados com contexto real de estrada.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-4 py-2">
                <ShieldCheck size={16} />
                pontos confiáveis para parada
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-4 py-2">
                <Compass size={16} />
                feito para decidir rápido no celular
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-4 py-2">
                <MapPinned size={16} />
                mapa no centro da experiência
              </span>
            </div>
          </div>

          <div className="space-y-4 rounded-[32px] border border-border/80 bg-background/50 p-4 md:p-5">
            <SearchBar
              placeholder="Busque destino, cidade, mirante, posto ou oficina"
              buttonLabel="Ver caminhos"
              targetPath="/explorar"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-border bg-surface p-4">
                <p className="text-xs text-muted">roteiros no radar</p>
                <p className="mt-2 text-3xl font-semibold text-text">128</p>
              </div>
              <div className="rounded-[24px] border border-border bg-surface p-4">
                <p className="text-xs text-muted">paradas mapeadas</p>
                <p className="mt-2 text-3xl font-semibold text-text">412</p>
              </div>
              <div className="rounded-[24px] border border-border bg-surface p-4">
                <p className="text-xs text-muted">reviews de estrada</p>
                <p className="mt-2 text-3xl font-semibold text-text">1.9k</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/planejar"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background"
          >
            Montar minha rota
            <ArrowRight size={16} />
          </Link>
          <Link href="/explorar" className="inline-flex rounded-full border border-border px-5 py-3 text-sm text-text">
            Explorar o radar
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Destaques</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Paradas que valem o desvio</h2>
          </div>
          <Link href="/explorar" className="text-sm text-muted">
            ver tudo
          </Link>
        </div>
        <FilterBar />
        <div className="grid gap-5 lg:grid-cols-2">
          {places.slice(0, 2).map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Viagens</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Roteiros que nasceram na estrada</h2>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
}
