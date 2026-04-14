import { BikersDirectoryClient } from "@/components/bikers-directory-client";
import { getBikersPageData } from "@/lib/server/site-data";

export const revalidate = 0;

export default async function BikersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const data = await getBikersPageData();

  return (
    <BikersDirectoryClient
      initialQuery={params.q ?? ""}
      initialProfiles={data.profiles}
      initialTrips={data.trips}
      useSupabase={data.useSupabase}
    />
  );
}
