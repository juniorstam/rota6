import { notFound } from "next/navigation";

import { ProfilePageClient } from "@/components/profile-page-client";
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
  const relatedUsers = users
    .filter((user) => user.id !== profile.id)
    .slice(0, 4)
    .map((user) => {
      const userTrips = trips.filter((trip) => trip.author.id === user.id);
      return {
        user,
        previewTrip: userTrips[0],
        tripCount: userTrips.length,
        photoCount: userTrips.reduce((count, trip) => count + trip.photos.length, 0)
      };
    });

  return (
    <ProfilePageClient
      profile={profile}
      profileTrips={profileTrips}
      profilePlaces={profilePlaces}
      profilePhotos={profilePhotos}
      relatedUsers={relatedUsers}
    />
  );
}
