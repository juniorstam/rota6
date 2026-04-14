import { ProfileRouteClient } from "@/components/profile-route-client";

export default async function ProfileFollowersPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileRouteClient username={username} section="followers" />;
}
