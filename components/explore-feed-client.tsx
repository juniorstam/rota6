"use client";

import { useEffect, useMemo, useState } from "react";

import { SearchBar } from "@/components/search-bar";
import { TripCard } from "@/components/trip-card";
import { trips } from "@/lib/mock-data";
import { PUBLISHED_TRIPS_EVENT, readPublishedTrips } from "@/lib/published-trips";
import { PublishedTrip } from "@/lib/types";

export function ExploreFeedClient({ initialQuery }: { initialQuery: string }) {
  const [localTrips, setLocalTrips] = useState<PublishedTrip[]>([]);

  useEffect(() => {
    const sync = () => setLocalTrips(readPublishedTrips());
    sync();

    window.addEventListener(PUBLISHED_TRIPS_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(PUBLISHED_TRIPS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const filteredTrips = useMemo(() => {
    const query = initialQuery.trim().toLowerCase();
    const mergedTrips = [...localTrips.filter((trip) => trip.publicVisibility), ...trips];

    if (!query) {
      return mergedTrips;
    }

    return mergedTrips.filter((trip) =>
      [trip.title, trip.summary, trip.origin, trip.destination, ...trip.tips, ...trip.tags].some((entry) =>
        entry.toLowerCase().includes(query)
      )
    );
  }, [initialQuery, localTrips]);

  return (
    <div className="space-y-8">
      <SearchBar
        placeholder="Buscar viagens, cidades, tags ou palavras-chave"
        buttonLabel="Explorar"
        initialValue={initialQuery}
        targetPath="/explorar"
      />

      <section className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
}
