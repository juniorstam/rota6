import { PlaceCard } from "@/components/place-card";
import { TripCard } from "@/components/trip-card";
import { favoriteLists, places, trips } from "@/lib/mock-data";

export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Favoritos</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Organize pontos, roteiros e viagens em listas simples</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          O MVP já prevê listas reutilizáveis para depois conectar com favoritos persistidos no banco.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {favoriteLists.map((list) => (
          <section key={list.id} className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Lista</p>
              <h2 className="mt-2 text-2xl font-semibold text-text">{list.name}</h2>
            </div>

            <div className="space-y-4">
              {list.itemIds.map((itemId) => {
                const place = places.find((entry) => entry.id === itemId);
                if (place) {
                  return <PlaceCard key={itemId} place={place} />;
                }

                const trip = trips.find((entry) => entry.id === itemId);
                if (trip) {
                  return <TripCard key={itemId} trip={trip} />;
                }

                return null;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
