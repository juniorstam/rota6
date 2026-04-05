import { BikerCard } from "@/components/biker-card";
import { SearchBar } from "@/components/search-bar";
import { trips, users } from "@/lib/mock-data";

export default async function BikersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const filteredUsers = query
    ? users.filter((user) =>
        [user.name, user.username, user.city, user.state, user.travelStyle, user.motorcycle, user.bio].some((entry) =>
          entry.toLowerCase().includes(query)
        )
      )
    : users;

  return (
    <div className="space-y-8">
      <SearchBar
        placeholder="Buscar biker, cidade, estilo de viagem ou moto"
        buttonLabel="Buscar"
        initialValue={params.q ?? ""}
        targetPath="/bikers"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {filteredUsers.map((user) => {
          const userTrips = trips.filter((trip) => trip.author.id === user.id);
          const photoCount = userTrips.reduce((count, trip) => count + trip.photos.length, 0);
          return (
            <BikerCard
              key={user.id}
              user={user}
              tripCount={userTrips.length}
              photoCount={photoCount}
            />
          );
        })}
      </div>
    </div>
  );
}
