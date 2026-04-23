"use client";

import { ReactNode, useEffect, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";

import { SearchAutocompleteSuggestion, SearchSuggestion } from "@/lib/rebuild/types";

interface LocationSearchFieldProps {
  label: string;
  value: SearchSuggestion | null;
  onSelect: (value: SearchSuggestion | null) => void;
  placeholder: string;
  compact?: boolean;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconButtonLabel?: string;
  iconLoading?: boolean;
  proximity?: { lat: number; lng: number } | null;
}

const TYPE_LABELS: Record<string, string> = {
  city: "Cidade",
  address: "Endereço",
  restaurant: "Restaurante",
  hotel: "Hotel",
  bar: "Bar",
  fuel: "Posto",
  repair: "Oficina",
  tourism: "Turismo",
  rota6_place: "Rota 6",
  poi: "Local"
};

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }

  const normalizedText = text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const normalizedQuery = trimmed.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (index < 0) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-accent/20 px-0.5 text-text">{text.slice(index, index + trimmed.length)}</mark>
      {text.slice(index + trimmed.length)}
    </>
  );
}

export function LocationSearchField({
  label,
  value,
  onSelect,
  placeholder,
  compact = false,
  icon,
  onIconClick,
  iconButtonLabel,
  iconLoading = false,
  proximity = null
}: LocationSearchFieldProps) {
  const [query, setQuery] = useState(value?.fullAddress ?? "");
  const [results, setResults] = useState<SearchAutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  );
  const trimmedQuery = query.trim();

  useEffect(() => {
    setQuery(value?.fullAddress ?? "");
  }, [value]);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          session_token: sessionToken
        });

        if (proximity) {
          params.set("lat", proximity.lat.toString());
          params.set("lng", proximity.lng.toString());
        }

        const response = await fetch(`/api/route-search/suggest?${params.toString()}`);
        const payload = response.ok ? ((await response.json()) as SearchAutocompleteSuggestion[]) : [];
        setResults(payload);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [proximity, sessionToken, trimmedQuery]);

  async function selectResult(result: SearchAutocompleteSuggestion) {
    if (result.lat !== undefined && result.lng !== undefined) {
      onSelect({
        id: result.id,
        name: result.name,
        fullAddress: result.fullAddress,
        lat: result.lat,
        lng: result.lng,
        type: result.type,
        source: result.source,
        score: result.score
      });
      setQuery(result.fullAddress);
      setResults([]);
      return;
    }

    const retrieveId = result.source === "google" ? result.id : result.mapboxId;
    if (!retrieveId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        id: retrieveId,
        session_token: sessionToken
      });
      const response = await fetch(`/api/route-search/retrieve?${params.toString()}`);
      const payload = response.ok ? ((await response.json()) as SearchSuggestion) : null;

      if (payload) {
        onSelect(payload);
        setQuery(payload.fullAddress);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="sr-only">{label}</label>
      <div className="relative">
        {onIconClick ? (
          <button
            type="button"
            onClick={onIconClick}
            aria-label={iconButtonLabel ?? label}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted transition hover:text-text"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              {iconLoading ? <LoaderCircle size={14} className="animate-spin" /> : icon ?? <Search size={14} />}
            </span>
          </button>
        ) : (
          <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              {icon ?? <Search size={14} />}
            </div>
          </div>
        )}
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onSelect(null);
          }}
          placeholder={placeholder}
          className={`w-full rounded-[20px] border border-white/10 bg-[rgba(8,14,22,0.72)] pl-[3.15rem] pr-4 text-[16px] text-text shadow-[0_12px_32px_rgba(0,0,0,0.2)] outline-none transition placeholder:text-muted/65 focus:border-accent/80 focus:bg-[rgba(8,14,22,0.88)] md:text-sm ${compact ? "h-[52px]" : "h-12"}`}
        />

        {(results.length > 0 || loading || (trimmedQuery.length >= 2 && !loading && results.length === 0)) && !value ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.32rem)] z-20 overflow-hidden rounded-[18px] border border-white/10 bg-[rgba(10,16,24,0.97)] shadow-glow backdrop-blur-xl">
            {loading ? <p className="px-3 py-3 text-sm text-muted">Buscando...</p> : null}
            {!loading && trimmedQuery.length >= 2 && results.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted">
                Nenhum local apareceu na busca. Tente um nome mais completo.
              </p>
            ) : null}
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => selectResult(result)}
                className="block w-full border-b border-border/80 px-3 py-3 text-left last:border-b-0 hover:bg-surfaceAlt"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium text-text">
                    {highlightMatch(result.name, trimmedQuery)}
                  </p>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                    {TYPE_LABELS[result.type ?? "poi"] ?? "Local"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{result.fullAddress}</p>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
