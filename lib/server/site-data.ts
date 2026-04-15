import { trips as mockTrips, users as mockUsers } from "@/lib/mock-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { PublishedTrip, UserProfile } from "@/lib/types";
import {
  getProfileByUsernameFromDb,
  listProfilesFromDb
} from "@/lib/repositories/profile-repository";
import {
  getTripByAuthorAndSlugFromDb,
  getTripBySlugFromDb,
  listPublicTripsFromDb
} from "@/lib/repositories/trip-repository";

function toPublicProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    email: "",
    contactEmail: undefined,
    isAdmin: false
  };
}

export async function getBikersPageData(): Promise<{
  profiles: UserProfile[];
  trips: PublishedTrip[];
  useSupabase: boolean;
}> {
  if (hasSupabaseEnv()) {
    const [profiles, trips] = await Promise.all([listProfilesFromDb(), listPublicTripsFromDb()]);
    return { profiles: profiles.map(toPublicProfile), trips, useSupabase: true };
  }

  return { profiles: mockUsers.map(toPublicProfile), trips: mockTrips, useSupabase: false };
}

export async function getExplorePageData(): Promise<{
  trips: PublishedTrip[];
  useSupabase: boolean;
}> {
  if (hasSupabaseEnv()) {
    return { trips: await listPublicTripsFromDb(), useSupabase: true };
  }

  return { trips: mockTrips, useSupabase: false };
}

export async function getProfilePageData(username: string): Promise<{
  profile: UserProfile | null;
  allProfiles: UserProfile[];
  profileTrips: PublishedTrip[];
  profilePhotos: string[];
  useSupabase: boolean;
}> {
  if (hasSupabaseEnv()) {
    const [profile, allProfiles, allTrips] = await Promise.all([
      getProfileByUsernameFromDb(username),
      listProfilesFromDb(),
      listPublicTripsFromDb()
    ]);
    const profileTrips = allTrips.filter((trip) => trip.author.username === username);

    return {
      profile: profile ? toPublicProfile(profile) : null,
      allProfiles: allProfiles.map(toPublicProfile),
      profileTrips,
      profilePhotos: profileTrips.flatMap((trip) => trip.photos),
      useSupabase: true
    };
  }

  const profile = mockUsers.find((entry) => entry.username === username) ?? null;
  const profileTrips = mockTrips.filter((trip) => trip.author.username === username);

  return {
    profile: profile ? toPublicProfile(profile) : null,
    allProfiles: mockUsers.map(toPublicProfile),
    profileTrips,
    profilePhotos: profileTrips.flatMap((trip) => trip.photos),
    useSupabase: false
  };
}

export async function getTripPageData(
  slug: string,
  username?: string
): Promise<{ trip: PublishedTrip | null; useSupabase: boolean }> {
  if (hasSupabaseEnv()) {
    const trip = username ? await getTripByAuthorAndSlugFromDb(username, slug) : await getTripBySlugFromDb(slug);
    return { trip, useSupabase: true };
  }

  const trip = username
    ? mockTrips.find((entry) => entry.author.username === username && entry.slug === slug) ?? null
    : mockTrips.find((entry) => entry.slug === slug) ?? null;

  return { trip, useSupabase: false };
}
