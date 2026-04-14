"use client";

import { useEffect, useMemo, useState } from "react";

import { BikerCard } from "@/components/biker-card";
import { SearchBar } from "@/components/search-bar";
import { LOCAL_PROFILES_EVENT, getMergedProfiles } from "@/lib/local-profiles";
import { trips } from "@/lib/mock-data";
import { PUBLISHED_TRIPS_EVENT, readPublishedTrips } from "@/lib/published-trips";
import { UserProfile } from "@/lib/types";

export function BikersDirectoryClient({ initialQuery }: { initialQuery: string }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getMergedProfiles());
  const [localTrips, setLocalTrips] = useState(() => readPublishedTrips());

  useEffect(() => {
    const syncProfiles = () => setProfiles(getMergedProfiles());
    const syncTrips = () => setLocalTrips(readPublishedTrips());

    syncProfiles();
    syncTrips();

    window.addEventListener(LOCAL_PROFILES_EVENT, syncProfiles);
    window.addEventListener(PUBLISHED_TRIPS_EVENT, syncTrips);
    window.addEventListener("storage", syncProfiles);
    window.addEventListener("storage", syncTrips);

    return () => {
      window.removeEventListener(LOCAL_PROFILES_EVENT, syncProfiles);
      window.removeEventListener(PUBLISHED_TRIPS_EVENT, syncTrips);
      window.removeEventListener("storage", syncProfiles);
      window.removeEventListener("storage", syncTrips);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = initialQuery.trim().toLowerCase();
    if (!query) {
      return profiles;
    }

    return profiles.filter((user) =>
      [
        user.name,
        user.username,
        user.city,
        user.state,
        user.region,
        user.travelStyle,
        user.motorcycle,
        user.motorcycleBrand,
        user.motorcycleModel,
        user.bio
      ]
        .filter(Boolean)
        .some((entry) => String(entry).toLowerCase().includes(query))
    );
  }, [initialQuery, profiles]);

  return (
    <div className="space-y-8">
      <SearchBar
        placeholder="Buscar biker, cidade, estilo de viagem ou moto"
        buttonLabel="Buscar"
        initialValue={initialQuery}
        targetPath="/bikers"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {filteredUsers.map((user) => {
          const mockTripCount = trips.filter((trip) => trip.author.id === user.id).length;
          const mockPhotoCount = trips
            .filter((trip) => trip.author.id === user.id)
            .reduce((count, trip) => count + trip.photos.length, 0);

          const ownLocalTrips = localTrips.filter((trip) => trip.author.id === user.id && trip.publicVisibility);
          const localPhotoCount = ownLocalTrips.reduce((count, trip) => count + trip.photos.length, 0);

          return (
            <BikerCard
              key={user.id}
              user={user}
              tripCount={mockTripCount + ownLocalTrips.length}
              photoCount={mockPhotoCount + localPhotoCount}
            />
          );
        })}
      </div>
    </div>
  );
}
