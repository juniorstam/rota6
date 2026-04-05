import { notFound } from "next/navigation";

import { ProfileConnectionsClient } from "@/components/profile-connections-client";
import { UserProfileHeader } from "@/components/user-profile-header";
import { getProfileByUsername } from "@/lib/profile-data";

export default async function ProfileFollowingPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <UserProfileHeader profile={profile} />
      <ProfileConnectionsClient profile={profile} mode="following" />
    </div>
  );
}
