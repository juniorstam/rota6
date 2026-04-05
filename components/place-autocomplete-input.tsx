"use client";

import { useEffect, useId, useState } from "react";
import { LoaderCircle, MapPin } from "lucide-react";

import { PlaceSearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlaceAutocompleteInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelect?: (place: PlaceSearchResult) => void;
}

export function PlaceAutocompleteInput({
  label,
  value,
  placeholder,
  onChange,
  onSelect
}: PlaceAutocompleteInputProps) {
  const inputId = useId();
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value.trim().length < 3) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/maps/search?q=${encodeURIComponent(value)}`);
        const payload = (await response.json()) as PlaceSearchResult[];
        setResults(Array.isArray(payload) ? payload : []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [value]);

  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <div className="relative">
        <input
          id={inputId}
          value={value}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 w-full rounded-[20px] border border-border bg-background px-4 pr-11 text-sm text-text outline-none focus:border-accent"
          placeholder={placeholder}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <MapPin size={16} />}
        </div>

        {open && results.length > 0 && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[22px] border border-border bg-surface shadow-glow">
            {results.map((result) => (
              <button
                type="button"
                key={result.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(result.fullAddress);
                  onSelect?.(result);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border/70 px-4 py-3 text-left last:border-b-0",
                  "transition hover:bg-background/70"
                )}
              >
                <MapPin size={16} className="mt-1 text-accent" />
                <span className="block">
                  <span className="block text-sm font-medium text-text">{result.name}</span>
                  <span className="block text-xs text-muted">{result.fullAddress}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
