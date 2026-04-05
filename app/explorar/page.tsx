import { SearchBar } from "@/components/search-bar";
import { TripCard } from "@/components/trip-card";
import { trips } from "@/lib/mock-data";

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";

  const filteredTrips = query
    ? trips.filter((trip) =>
        [trip.title, trip.summary, trip.origin, trip.destination, ...trip.tips, ...trip.tags].some((entry) =>
          entry.toLowerCase().includes(query)
        )
      )
    : trips;

  return (
    <div className="space-y-8">
      <SearchBar
        placeholder="Buscar viagens, cidades, tags ou palavras-chave"
        buttonLabel="Explorar"
        initialValue={params.q ?? ""}
        targetPath="/explorar"
      />

      <section className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </div>
  );
}
