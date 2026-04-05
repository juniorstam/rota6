import { places, trips, users } from "@/lib/mock-data";

export function getProfileByUsername(username: string) {
  return users.find((entry) => entry.username === username) ?? null;
}

export function getProfileTrips(profileId: string) {
  return trips.filter((trip) => trip.author.id === profileId);
}

export function getProfilePhotos(profileId: string) {
  return getProfileTrips(profileId).flatMap((trip) => trip.photos);
}

export function getProfilePlaces(profileId: string) {
  return places.filter((place) => place.reviews.some((review) => review.userId === profileId));
}

export function getRelatedUsers(profileId: string) {
  return users
    .filter((user) => user.id !== profileId)
    .slice(0, 4)
    .map((user) => {
      const userTrips = getProfileTrips(user.id);
      return {
        user,
        tripCount: userTrips.length,
        photoCount: userTrips.reduce((count, trip) => count + trip.photos.length, 0)
      };
    });
}
