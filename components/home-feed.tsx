"use client";

import Link from "next/link";

import { BikerCard } from "@/components/biker-card";
import { FilterBar } from "@/components/filter-bar";
import { PlaceCard } from "@/components/place-card";
import { RouteFeedCard } from "@/components/route-feed-card";
import { places, trips, users } from "@/lib/mock-data";
import { useFollowing } from "@/providers/following-provider";

export function HomeFeed() {
  const { followingIds } = useFollowing();
  const followedUsers = users.filter((user) => followingIds.includes(user.id));
  const followedTrips = trips.filter((trip) => followingIds.includes(trip.author.id));

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Início</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Rotas e registros de quem você segue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          A home agora funciona como feed útil de viagem. Em vez de um bloco institucional, você vê o que a sua rede
          publicou de mais relevante para a próxima estrada.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] border border-border bg-background/50 p-4">
            <p className="text-xs text-muted">seguindo</p>
            <p className="mt-2 text-3xl font-semibold text-text">{followedUsers.length}</p>
          </div>
          <div className="rounded-[24px] border border-border bg-background/50 p-4">
            <p className="text-xs text-muted">rotas da sua rede</p>
            <p className="mt-2 text-3xl font-semibold text-text">{followedTrips.length}</p>
          </div>
          <div className="rounded-[24px] border border-border bg-background/50 p-4">
            <p className="text-xs text-muted">fotos da sua rede</p>
            <p className="mt-2 text-3xl font-semibold text-text">
              {followedTrips.reduce((count, trip) => count + trip.photos.length, 0)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Seguindo</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Viagens publicadas por quem você acompanha</h2>
          </div>
          <Link href="/explorar" className="text-sm text-muted">
            ver tudo
          </Link>
        </div>
        {followedTrips.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {followedTrips.map((trip) => (
              <RouteFeedCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Você ainda não segue ninguém. Vá em <Link href="/bikers" className="text-text underline">Bikers</Link> e
            monte sua rede para alimentar esta home.
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Bikers</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Perfis que você acompanha</h2>
          </div>
          <Link href="/bikers" className="text-sm text-muted">
            ver bikers
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {followedUsers.map((user) => {
            const userTrips = trips.filter((trip) => trip.author.id === user.id);
            const photoCount = userTrips.reduce((count, trip) => count + trip.photos.length, 0);
            return (
              <BikerCard
                key={user.id}
                user={user}
                previewTrip={userTrips[0]}
                tripCount={userTrips.length}
                photoCount={photoCount}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Paradas</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Pontos em destaque no radar</h2>
          </div>
        </div>
        <FilterBar />
        <div className="grid gap-5 lg:grid-cols-2">
          {places.slice(0, 4).map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </div>
  );
}
