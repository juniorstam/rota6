"use client";

import { useEffect, useMemo, useState } from "react";

import { BikerCard } from "@/components/biker-card";
import { SearchBar } from "@/components/search-bar";
import { LOCAL_PROFILES_EVENT, getMergedProfiles } from "@/lib/local-profiles";
import { trips } from "@/lib/mock-data";
import { PUBLISHED_TRIPS_EVENT, readPublishedTrips } from "@/lib/published-trips";
import { PublishedTrip, UserProfile } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

export function BikersDirectoryClient({
  initialQuery,
  initialProfiles,
  initialTrips,
  useSupabase
}: {
  initialQuery: string;
  initialProfiles: UserProfile[];
  initialTrips: PublishedTrip[];
  useSupabase: boolean;
}) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>(() => (useSupabase ? initialProfiles : getMergedProfiles()));
  const [localTrips, setLocalTrips] = useState<PublishedTrip[]>(() => (useSupabase ? initialTrips : readPublishedTrips()));

  useEffect(() => {
    if (useSupabase) {
      setProfiles(initialProfiles);
      setLocalTrips(initialTrips);
      return;
    }

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
  }, [initialProfiles, initialTrips, useSupabase]);

  const filteredUsers = useMemo(() => {
    const mergedProfiles =
      useSupabase && user && !profiles.some((profile) => profile.id === user.id) ? [user, ...profiles] : profiles;
    const query = initialQuery.trim().toLowerCase();
    if (!query) {
      return mergedProfiles;
    }

    return mergedProfiles.filter((user) =>
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
  }, [initialQuery, profiles, useSupabase, user]);

  return (
    <div className="space-y-8">
      <SearchBar
        placeholder="Buscar biker, cidade, estilo de viagem ou moto"
        buttonLabel="Buscar"
        initialValue={initialQuery}
        targetPath="/bikers"
      />

      {filteredUsers.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredUsers.map((user) => {
            const baseTrips = useSupabase ? initialTrips : trips;
            const baseTripCount = baseTrips.filter((trip) => trip.author.id === user.id).length;
            const basePhotoCount = baseTrips
              .filter((trip) => trip.author.id === user.id)
              .reduce((count, trip) => count + trip.photos.length, 0);

            const ownLocalTrips = useSupabase
              ? []
              : localTrips.filter((trip) => trip.author.id === user.id && trip.publicVisibility);
            const localPhotoCount = ownLocalTrips.reduce((count, trip) => count + trip.photos.length, 0);

            return (
              <BikerCard
                key={user.id}
                user={user}
                tripCount={baseTripCount + ownLocalTrips.length}
                photoCount={basePhotoCount + localPhotoCount}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
          Nenhum biker apareceu por enquanto. Se você acabou de criar contas, entre nelas novamente para concluir a
          sincronização do perfil público.
        </div>
      )}
    </div>
  );
}
