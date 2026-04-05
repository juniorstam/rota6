"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function FavoriteButton() {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setActive((current) => !current)}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border transition",
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
