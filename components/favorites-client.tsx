"use client";

import { useFavorites } from "@/providers/favorites-provider";
import { PlaceCard } from "@/components/place-card";
import { TripCard } from "@/components/trip-card";
import { places, trips } from "@/lib/mock-data";
import { getFavoriteKey } from "@/lib/favorites";

export function FavoritesClient() {
  const { lists } = useFavorites();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {lists.map((list) => (
        <section key={list.id} className="rounded-[32px] border border-border bg-surface p-5 md:p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Lista</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">{list.name}</h2>
          </div>

          {list.itemIds.length > 0 ? (
            <div className="space-y-4">
              {list.itemIds.map((itemKey) => {
                const place = places.find((entry) => getFavoriteKey("place", entry.id) === itemKey);
                if (place) {
                  return <PlaceCard key={itemKey} place={place} />;
                }

                const trip = trips.find((entry) => getFavoriteKey("trip", entry.id) === itemKey);
                if (trip) {
                  return <TripCard key={itemKey} trip={trip} />;
                }

                return null;
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-background/40 p-6 text-sm text-muted">
              Nada salvo aqui ainda. Favorite lugares e viagens para começar a montar sua memória de estrada.
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
