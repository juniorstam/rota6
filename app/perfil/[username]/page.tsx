import { notFound } from "next/navigation";

import { PhotoGallery } from "@/components/photo-gallery";
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

  const profileTrips = trips.filter((trip) => trip.author.id === profile.id);
  const profilePlaces = places.filter((place) =>
    place.reviews.some((review) => review.userId === profile.id) || place.createdBy === "usuario"
  );
  const profilePhotos = profileTrips.flatMap((trip) => trip.photos);

  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile} />

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Viagens publicadas</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Roteiros compartilhados por {profile.name}</h2>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {profileTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Fotos</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Memórias de estrada do perfil</h2>
        </div>
        {profilePhotos.length > 0 ? (
          <PhotoGallery photos={profilePhotos.slice(0, 6)} />
        ) : (
          <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-sm text-muted">
            Este perfil ainda não publicou fotos de viagem.
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Recomendações</p>
          <h2 className="mt-2 text-2xl font-semibold text-text">Lugares marcantes no radar do perfil</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {profilePlaces.slice(0, 2).map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </div>
  );
}
