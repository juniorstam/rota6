import Link from "next/link";

import { FilterBar } from "@/components/filter-bar";
import { PlaceCard } from "@/components/place-card";
import { SearchBar } from "@/components/search-bar";
import { TripCard } from "@/components/trip-card";
import { UserCard } from "@/components/user-card";
import { followingByUserId, places, trips, users } from "@/lib/mock-data";

export default function HomePage() {
  const currentUser = users[0];
  const followedIds = followingByUserId[currentUser.id] ?? [];
  const followedUsers = users.filter((user) => followedIds.includes(user.id));
  const followedTrips = trips.filter((trip) => followedIds.includes(trip.author.id));

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Início</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Rotas e registros de quem você segue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          A página inicial agora mostra as viagens mais recentes das pessoas que você acompanha e cria uma sensação de
          movimento real dentro da Rota 6.
        </p>
        <div className="mt-6">
          <SearchBar
            placeholder="Busque pessoas, viagens, cidades, oficinas ou mirantes"
            buttonLabel="Explorar"
            targetPath="/explorar"
          />
        </div>
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
        <div className="grid gap-5 xl:grid-cols-2">
          {followedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Pessoas</p>
            <h2 className="mt-2 text-2xl font-semibold text-text">Perfis que você acompanha</h2>
          </div>
          <Link href="/pessoas" className="text-sm text-muted">
            ver pessoas
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {followedUsers.map((user) => {
            const userTrips = trips.filter((trip) => trip.author.id === user.id);
            const photoCount = userTrips.reduce((count, trip) => count + trip.photos.length, 0);
            return <UserCard key={user.id} user={user} tripCount={userTrips.length} photoCount={photoCount} />;
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
