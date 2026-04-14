import { ExploreFeedClient } from "@/components/explore-feed-client";
import { getExplorePageData } from "@/lib/server/site-data";

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const data = await getExplorePageData();

  return (
    <ExploreFeedClient
      initialQuery={params.q ?? ""}
      initialTrips={data.trips}
      useSupabase={data.useSupabase}
    />
  );
}
