import { notFound } from "next/navigation";

import { ProfilePageClient } from "@/components/profile-page-client";
import { getProfileByUsername, getProfilePhotos, getProfileTrips } from "@/lib/profile-data";

export default async function ProfilePage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const profileTrips = getProfileTrips(profile.id);
  const profilePhotos = getProfilePhotos(profile.id);

  return (
    <ProfilePageClient
      profile={profile}
      profileTrips={profileTrips}
      profilePhotos={profilePhotos}
    />
  );
}
