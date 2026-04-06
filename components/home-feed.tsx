"use client";

import Link from "next/link";

import { RouteFeedCard } from "@/components/route-feed-card";
import { trips } from "@/lib/mock-data";
import { useAuth } from "@/providers/auth-provider";
import { useFollowing } from "@/providers/following-provider";

export function HomeFeed() {
  const { user, loading } = useAuth();
  const { currentUserId, followingIds } = useFollowing();
  const visibleAuthorIds =
    currentUserId && user ? Array.from(new Set([currentUserId, ...followingIds])) : followingIds;
  const followedTrips = trips.filter((trip) => visibleAuthorIds.includes(trip.author.id));

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
