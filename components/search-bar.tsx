"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder: string;
  buttonLabel?: string;
}

export function SearchBar({ placeholder, buttonLabel = "Buscar" }: SearchBarProps) {
  return (
    <form className="flex w-full flex-col gap-3 rounded-[28px] border border-border/80 bg-surface/90 p-3 shadow-glow md:flex-row">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          className="h-14 w-full rounded-[22px] border border-border bg-background/70 pl-11 pr-4 text-sm text-text outline-none ring-0 transition placeholder:text-muted focus:border-accent"
          placeholder={placeholder}
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-14 items-center justify-center rounded-[22px] bg-accent px-5 text-sm font-semibold text-background"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
