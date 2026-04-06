import { RouteFeedCard } from "@/components/route-feed-card";
import { PublishedTrip } from "@/lib/types";

export function TripCard({ trip }: { trip: PublishedTrip }) {
  return <RouteFeedCard trip={trip} />;
}
