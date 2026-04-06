"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { useFavorites } from "@/providers/favorites-provider";

export function FavoriteButton({ id, type }: { id: string; type: "place" | "trip" }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(type, id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(type, id)}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border transition sm:h-11 sm:w-11",
        active
          ? "border-accent bg-accent text-background"
          : "border-border bg-background/70 text-muted"
      )}
      aria-label="Salvar item"
    >
      <Heart size={18} className={active ? "fill-background" : ""} />
    </button>
  );
}
