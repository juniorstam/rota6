import { HomeFeed } from "@/components/home-feed";
import { getExplorePageData } from "@/lib/server/site-data";

export default async function HomePage() {
  const data = await getExplorePageData();
  return <HomeFeed initialTrips={data.trips} useSupabase={data.useSupabase} />;
}
