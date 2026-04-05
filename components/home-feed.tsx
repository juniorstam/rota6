"use client";

import Link from "next/link";

import { RouteFeedCard } from "@/components/route-feed-card";
import { trips } from "@/lib/mock-data";
import { useFollowing } from "@/providers/following-provider";

export function HomeFeed() {
  const { followingIds } = useFollowing();
  const followedTrips = trips.filter((trip) => followingIds.includes(trip.author.id));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {followedTrips.length > 0 ? (
        followedTrips.map((trip) => <RouteFeedCard key={trip.id} trip={trip} />)
      ) : (
        <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
          Você ainda não segue ninguém. Vá em <Link href="/bikers" className="text-text underline">Bikers</Link> e
          monte sua rede para alimentar esta home.
        </div>
      )}
    </div>
  );
}
