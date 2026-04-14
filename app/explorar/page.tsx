import { ExploreFeedClient } from "@/components/explore-feed-client";

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <ExploreFeedClient initialQuery={params.q ?? ""} />;
}
