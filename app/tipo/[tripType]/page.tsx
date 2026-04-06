import { notFound } from "next/navigation";

import { TripCard } from "@/components/trip-card";
import { trips } from "@/lib/mock-data";
import { tripTypeLabels } from "@/lib/trip-taxonomy";
import { TripType } from "@/lib/types";

function isTripType(value: string): value is TripType {
  return value === "solo" || value === "casal" || value === "grupo";
}

export default async function TripTypePage({
  params
}: {
  params: Promise<{ tripType: string }>;
}) {
  const { tripType } = await params;

  if (!isTripType(tripType)) {
    notFound();
  }

  const filteredTrips = trips.filter((trip) => trip.tripType === tripType);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-accentSoft">Tipo de viagem</p>
        <h1 className="text-3xl font-semibold text-text">{tripTypeLabels[tripType]}</h1>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
