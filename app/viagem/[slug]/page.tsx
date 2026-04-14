import { TripDetailsClient } from "@/components/trip-details-client";
import { getTripPageData } from "@/lib/server/site-data";

export default async function TripDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTripPageData(slug);
  return <TripDetailsClient slug={slug} initialTrip={data.trip} useSupabase={data.useSupabase} />;
}
