import { ProfileRouteClient } from "@/components/profile-route-client";

export default async function ProfileFollowingPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfileRouteClient username={username} section="following" />;
}
