import { UserCard } from "@/components/user-card";
import { FilterBar } from "@/components/filter-bar";
import { PlaceCard } from "@/components/place-card";
import { SearchBar } from "@/components/search-bar";
import { TripCard } from "@/components/trip-card";
import { places, trips, users } from "@/lib/mock-data";

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";

  const filteredPlaces = query
    ? places.filter((place) =>
        [place.name, place.description, place.city, place.state, ...place.tags].some((entry) =>
          entry.toLowerCase().includes(query)
        )
      )
    : places;

  const filteredTrips = query
    ? trips.filter((trip) =>
        [trip.title, trip.summary, trip.origin, trip.destination, ...trip.tips].some((entry) =>
          entry.toLowerCase().includes(query)
        )
      )
    : trips;

  const filteredUsers = query
    ? users.filter((user) =>
        [user.name, user.username, user.city, user.state, user.bio, user.motorcycle].some((entry) =>
          entry.toLowerCase().includes(query)
        )
      )
    : users;

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Explorar</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Descubra caminhos, apoios de estrada e alertas úteis</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          O radar da Rota 6 cruza paradas avaliadas, viagens publicadas e trechos de atenção para você decidir melhor
          antes de acelerar.
        </p>
        <div className="mt-6">
          <SearchBar
            placeholder="Destino, cidade, oficina, mirante, usuário ou trecho de atenção..."
            buttonLabel="Explorar"
            initialValue={params.q ?? ""}
            targetPath="/explorar"
          />
        </div>
      </section>

      {query ? (
        <section className="rounded-[28px] border border-border bg-surface p-5 text-sm text-muted">
          Resultados para <span className="font-semibold text-text">"{params.q}"</span>: {filteredUsers.length} perfis,{" "}
          {filteredTrips.length} viagens e {filteredPlaces.length} lugares.
        </section>
      ) : null}

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Pessoas</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Motociclistas e perfis públicos no radar</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredUsers.map((user) => {
            const userTrips = trips.filter((trip) => trip.author.id === user.id);
            const photoCount = userTrips.reduce((count, trip) => count + trip.photos.length, 0);
            return <UserCard key={user.id} user={user} tripCount={userTrips.length} photoCount={photoCount} />;
          })}
        </div>
      </section>

      <FilterBar />

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Feed leve</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Viagens recém-compartilhadas no radar</h2>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
}
