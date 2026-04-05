import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPinned, Route } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import { PublishedTrip } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";

export function TripCard({ trip }: { trip: PublishedTrip }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-surface shadow-glow">
      <div className="relative h-60">
        <Image src={trip.coverUrl} alt={trip.title} fill className="object-cover" />
        <div className="absolute right-4 top-4">
          <FavoriteButton id={trip.id} type="trip" />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-accent px-3 py-1 font-semibold text-white">{trip.tripType}</span>
          <span className="rounded-full bg-surfaceAlt px-3 py-1 font-semibold capitalize text-text">
            estrada {trip.roadLevel}
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-text">{trip.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{trip.summary}</p>
        </div>

        <div className="inline-flex max-w-full items-center gap-2 text-sm text-muted" title={`${trip.origin} -> ${trip.destination}`}>
          <MapPinned size={16} className="shrink-0" />
          <span className="truncate">
            {trip.origin} {"->"} {trip.destination}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted">
          <div className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-4 py-2">
            <Route size={16} />
            {formatDistance(trip.distanceKm)}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-surfaceAlt px-4 py-2">
            <Clock3 size={16} />
            {formatDuration(trip.durationHours)}
          </div>
        </div>

        <Link
          href={`/viagem/${trip.slug}`}
          className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-text transition hover:bg-surfaceAlt"
        >
          Ver viagem
        </Link>
      </div>
    </article>
  );
}
