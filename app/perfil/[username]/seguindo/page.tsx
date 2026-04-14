import { ProfileRouteClient } from "@/components/profile-route-client";
import { getProfilePageData } from "@/lib/server/site-data";

export default async function ProfileFollowingPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getProfilePageData(username);

  return (
    <ProfileRouteClient
      username={username}
      section="following"
      initialProfile={data.profile}
      initialProfiles={data.allProfiles}
      initialTrips={data.profileTrips}
      initialPhotos={data.profilePhotos}
      useSupabase={data.useSupabase}
    />
  );
}
