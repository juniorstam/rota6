"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { SearchSuggestion } from "@/lib/rebuild/types";

interface LocationSearchFieldProps {
  label: string;
  value: SearchSuggestion | null;
  onSelect: (value: SearchSuggestion | null) => void;
  placeholder: string;
}

export function LocationSearchField({
  label,
  value,
  onSelect,
  placeholder
}: LocationSearchFieldProps) {
  const [query, setQuery] = useState(value?.fullAddress ?? "");
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value?.fullAddress ?? "");
  }, [value]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/route-search?q=${encodeURIComponent(trimmed)}`);
        const payload = response.ok ? ((await response.json()) as SearchSuggestion[]) : [];
        setResults(payload);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <Search size={15} />
        </div>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onSelect(null);
          }}
          placeholder={placeholder}
          className="h-11 w-full rounded-[12px] border border-border bg-background pl-10 pr-3 text-sm text-text outline-none transition focus:border-accent"
        />

        {(results.length > 0 || loading) && !value ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-20 overflow-hidden rounded-[14px] border border-border bg-surface shadow-glow">
            {loading ? <p className="px-3 py-3 text-sm text-muted">Buscando...</p> : null}
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => {
                  onSelect(result);
                  setQuery(result.fullAddress);
                  setResults([]);
                }}
                className="block w-full border-b border-border/80 px-3 py-3 text-left last:border-b-0 hover:bg-surfaceAlt"
              >
                <p className="text-sm font-medium text-text">{result.name}</p>
                <p className="mt-1 text-xs text-muted">{result.fullAddress}</p>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
