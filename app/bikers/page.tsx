import { BikerCard } from "@/components/biker-card";
import { SearchBar } from "@/components/search-bar";
import { trips, users } from "@/lib/mock-data";

export default function BikersPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Bikers</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Perfis úteis de estrada para acompanhar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Descubra motociclistas, veja o estilo de viagem de cada um e entre no histórico de rotas, fotos e registros.
        </p>
        <div className="mt-6">
          <SearchBar
            placeholder="Busque biker, cidade, estilo de viagem ou moto"
            buttonLabel="Explorar bikers"
            targetPath="/explorar"
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {users.map((user) => {
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
    </div>
  );
}
