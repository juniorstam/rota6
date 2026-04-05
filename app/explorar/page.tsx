import { FilterBar } from "@/components/filter-bar";
import { PlaceCard } from "@/components/place-card";
import { SearchBar } from "@/components/search-bar";
import { TripCard } from "@/components/trip-card";
import { places, trips } from "@/lib/mock-data";

export default function ExplorePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Explorar</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Descubra caminhos, apoios de estrada e alertas úteis</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          O radar da Rota 6 cruza paradas avaliadas, viagens publicadas e trechos de atenção para você decidir melhor
          antes de acelerar.
        </p>
        <div className="mt-6">
          <SearchBar placeholder="Destino, cidade, oficina, mirante ou trecho de atenção..." buttonLabel="Explorar" />
        </div>
      </section>

      <FilterBar />

      <section className="grid gap-5 lg:grid-cols-2">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Feed leve</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Viagens recém-compartilhadas no radar</h2>
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
