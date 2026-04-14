import { TripDetailsClient } from "@/components/trip-details-client";
import { getTripPageData } from "@/lib/server/site-data";

export default async function ProfileTripDetailsPage({
  params
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const data = await getTripPageData(slug, username);
  return <TripDetailsClient username={username} slug={slug} initialTrip={data.trip} useSupabase={data.useSupabase} />;
}
