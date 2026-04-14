"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { RouteFeedCard } from "@/components/route-feed-card";
import { trips } from "@/lib/mock-data";
import { PUBLISHED_TRIPS_EVENT, readPublishedTrips } from "@/lib/published-trips";
import { PublishedTrip } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { useFollowing } from "@/providers/following-provider";

export function HomeFeed({
  initialTrips,
  useSupabase
}: {
  initialTrips: PublishedTrip[];
  useSupabase: boolean;
}) {
  const { user, loading } = useAuth();
  const { currentUserId, followingIds } = useFollowing();
  const [localTrips, setLocalTrips] = useState<PublishedTrip[]>(() => (useSupabase ? initialTrips : []));

  useEffect(() => {
    if (useSupabase) {
      setLocalTrips(initialTrips);
      return;
    }

    const sync = () => setLocalTrips(readPublishedTrips());
    sync();

    window.addEventListener(PUBLISHED_TRIPS_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(PUBLISHED_TRIPS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [initialTrips, useSupabase]);

  const visibleAuthorIds =
    currentUserId && user ? Array.from(new Set([currentUserId, ...followingIds])) : followingIds;
  const followedTrips = useMemo(
    () =>
      (useSupabase ? initialTrips : [...localTrips, ...trips]).filter(
        (trip) => visibleAuthorIds.includes(trip.author.id) && trip.publicVisibility
      ),
    [initialTrips, localTrips, useSupabase, visibleAuthorIds]
  );

  if (loading) {
    return <div className="mx-auto max-w-3xl space-y-4" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {followedTrips.length > 0 ? (
        followedTrips.map((trip) => <RouteFeedCard key={trip.id} trip={trip} />)
      ) : (
        <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
          {user ? (
            <>
              Você ainda não segue ninguém. Vá em <Link href="/bikers" className="text-text underline">Bikers</Link> e
              monte sua rede para alimentar esta home.
            </>
          ) : (
            <>
              Entre na sua conta para ver seu feed personalizado, ou comece em{" "}
              <Link href="/explorar" className="text-text underline">Explorar</Link>.
            </>
          )}
        </div>
      )}
    </div>
  );
}
