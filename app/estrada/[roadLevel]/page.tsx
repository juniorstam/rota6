import { notFound } from "next/navigation";

import { TripCard } from "@/components/trip-card";
import { trips } from "@/lib/mock-data";
import { roadLevelLabels } from "@/lib/trip-taxonomy";
import { TripRoadLevel } from "@/lib/types";

function isRoadLevel(value: string): value is TripRoadLevel {
  return value === "tranquila" || value === "moderada" || value === "tecnica";
}

export default async function RoadLevelPage({
  params
}: {
  params: Promise<{ roadLevel: string }>;
}) {
  const { roadLevel } = await params;

  if (!isRoadLevel(roadLevel)) {
    notFound();
  }

  const filteredTrips = trips.filter((trip) => trip.roadLevel === roadLevel);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Dificuldade</p>
        <h1 className="text-3xl font-semibold text-text">{roadLevelLabels[roadLevel]}</h1>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
