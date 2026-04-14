import { TripDetailsClient } from "@/components/trip-details-client";

export default async function ProfileTripDetailsPage({
  params
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  return <TripDetailsClient username={username} slug={slug} />;
}
