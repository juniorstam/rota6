import { notFound } from "next/navigation";

import { PlaceCard } from "@/components/place-card";
import { TripCard } from "@/components/trip-card";
import { UserProfileHeader } from "@/components/user-profile-header";
import { places, trips, users } from "@/lib/mock-data";

export default async function ProfilePage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = users.find((entry) => entry.username === username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile} />

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Viagens publicadas</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Roteiros compartilhados por {profile.name}</h2>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {trips
            .filter((trip) => trip.author.id === profile.id)
            .map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Recomendações</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Lugares marcantes no radar do perfil</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {places.slice(0, 2).map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </div>
  );
}
