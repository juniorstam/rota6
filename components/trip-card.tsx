import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPinned, Route } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import { PublishedTrip } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";

export function TripCard({ trip }: { trip: PublishedTrip }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-surface">
      <div className="relative h-60">
        <Image src={trip.coverUrl} alt={trip.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute right-4 top-4">
          <FavoriteButton id={trip.id} type="trip" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 flex flex-wrap gap-2 text-xs text-background">
            <span className="rounded-full bg-accent px-3 py-1 font-semibold">{trip.tripType}</span>
            <span className="rounded-full bg-white/85 px-3 py-1 font-semibold text-background">
              estrada {trip.roadLevel}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-text">{trip.title}</h3>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm leading-6 text-muted">{trip.summary}</p>

        <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
          <div className="inline-flex items-center gap-2">
            <MapPinned size={16} />
            {trip.origin} {"->"} {trip.destination}
          </div>
          <div className="inline-flex items-center gap-2">
            <Route size={16} />
            {formatDistance(trip.distanceKm)}
          </div>
          <div className="inline-flex items-center gap-2">
            <Clock3 size={16} />
            {formatDuration(trip.durationHours)}
          </div>
        </div>

        <Link
          href={`/viagem/${trip.slug}`}
          className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-text"
        >
          Ver viagem
        </Link>
      </div>
    </article>
  );
}
