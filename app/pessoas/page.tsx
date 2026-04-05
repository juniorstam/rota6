import { UserCard } from "@/components/user-card";
import { trips, users } from "@/lib/mock-data";

export default function PeoplePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface p-5 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Pessoas</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Motociclistas, perfis e históricos de viagem</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Explore perfis públicos, veja quantas viagens cada pessoa publicou e entre no histórico visual de cada uma.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {users.map((user) => {
          const userTrips = trips.filter((trip) => trip.author.id === user.id);
          const photoCount = userTrips.reduce((count, trip) => count + trip.photos.length, 0);
          return <UserCard key={user.id} user={user} tripCount={userTrips.length} photoCount={photoCount} />;
        })}
      </div>
    </div>
  );
}
