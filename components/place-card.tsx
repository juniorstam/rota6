import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import { RatingStars } from "@/components/rating-stars";
import { Place } from "@/lib/types";

export function PlaceCard({ place }: { place: Place }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-surface">
      <div className="relative h-56">
        <Image src={place.photos[0]} alt={place.name} fill className="object-cover" />
        <div className="absolute right-4 top-4">
          <FavoriteButton />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.24em] text-accentSoft">{place.category}</p>
            <h3 className="text-lg font-semibold text-text">{place.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-text">{place.averageRating.toFixed(1)}</p>
            <RatingStars value={place.averageRating} />
          </div>
        </div>

        <p className="text-sm leading-6 text-muted">{place.description}</p>

        <div className="flex items-center gap-2 text-sm text-muted">
          <MapPin size={16} />
          <span>
            {place.city}, {place.state}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {place.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-background px-3 py-1 text-xs text-muted">
              #{tag}
            </span>
          ))}
        </div>

        <Link
          href={`/lugar/${place.slug}`}
          className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-text"
        >
          Ver lugar
        </Link>
      </div>
    </article>
  );
}
