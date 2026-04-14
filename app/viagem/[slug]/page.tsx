import { TripDetailsClient } from "@/components/trip-details-client";

export default async function TripDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TripDetailsClient slug={slug} />;
}
