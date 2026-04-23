import { SearchAutocompleteSuggestion, SearchSuggestion } from "@/lib/rebuild/types";
import { buildQueryVariants, inferRequestedType } from "@/lib/search/normalize";
import { SearchProvider, SearchProviderSuggestInput } from "@/lib/search/providers";
import { dedupeAndRank } from "@/lib/search/ranking";

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface SearchBoxSuggestResponse {
  suggestions?: Array<{
    name?: string;
    name_preferred?: string;
    mapbox_id?: string;
    full_address?: string;
    place_formatted?: string;
    feature_type?: string;
    poi_category?: string[];
  }>;
}

interface SearchBoxRetrieveResponse {
  features?: Array<{
    id?: string;
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      name?: string;
      full_address?: string;
      place_formatted?: string;
      mapbox_id?: string;
      feature_type?: string;
      poi_category?: string[];
    };
  }>;
}

interface ForwardGeocodeResponse {
  features?: Array<{
    id?: string;
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      name?: string;
      full_address?: string;
      place_formatted?: string;
      mapbox_id?: string;
      feature_type?: string;
      poi_category?: string[];
    };
  }>;
}

async function mapboxFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Mapbox request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function classifyMapboxResult(featureType?: string, categories?: string[]) {
  const text = `${featureType ?? ""} ${(categories ?? []).join(" ")}`.toLowerCase();

  if (text.includes("hotel") || text.includes("lodging")) return "hotel";
  if (text.includes("restaurant") || text.includes("food")) return "restaurant";
  if (text.includes("bar")) return "bar";
  if (text.includes("gas") || text.includes("fuel")) return "fuel";
  if (text.includes("repair") || text.includes("mechanic")) return "repair";
  if (text.includes("tourism") || text.includes("attraction") || text.includes("landmark")) return "tourism";
  if (featureType === "address") return "address";
  if (featureType === "place") return "city";

  return "poi";
}

function toAutocompleteSuggestion(
  suggestion: NonNullable<SearchBoxSuggestResponse["suggestions"]>[number]
): SearchAutocompleteSuggestion | null {
  if (!suggestion.mapbox_id || !suggestion.name) {
    return null;
  }

  return {
    id: suggestion.mapbox_id,
    mapboxId: suggestion.mapbox_id,
    name: suggestion.name_preferred ?? suggestion.name,
    fullAddress: suggestion.full_address ?? suggestion.place_formatted ?? suggestion.name,
    source: "mapbox",
    type: classifyMapboxResult(suggestion.feature_type, suggestion.poi_category)
  };
}

function toRetrievedSuggestion(
  feature: NonNullable<SearchBoxRetrieveResponse["features"]>[number],
  fallbackId: string
): SearchSuggestion | null {
  const coordinates = feature.geometry?.coordinates;
  if (!coordinates) {
    return null;
  }

  const name = feature.properties?.name ?? "Local";

  return {
    id: feature.properties?.mapbox_id ?? feature.id ?? fallbackId,
    providerPlaceId: feature.properties?.mapbox_id ?? feature.id,
    name,
    fullAddress: feature.properties?.full_address ?? feature.properties?.place_formatted ?? name,
    lat: coordinates[1],
    lng: coordinates[0],
    source: "mapbox",
    type: classifyMapboxResult(feature.properties?.feature_type, feature.properties?.poi_category)
  };
}

async function suggestVariant({
  query,
  sessionToken,
  proximity
}: SearchProviderSuggestInput): Promise<SearchAutocompleteSuggestion[]> {
  if (!MAPBOX_TOKEN) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    access_token: MAPBOX_TOKEN,
    session_token: sessionToken,
    language: "pt-BR",
    country: "BR",
    limit: "6"
  });

  if (proximity) {
    params.set("proximity", `${proximity.lng},${proximity.lat}`);
  }

  const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`;
  const response = await mapboxFetch<SearchBoxSuggestResponse>(url);

  return (response.suggestions ?? []).map(toAutocompleteSuggestion).filter((entry): entry is SearchAutocompleteSuggestion => entry !== null);
}

async function forwardVariant({
  query,
  proximity
}: {
  query: string;
  proximity?: { lat: number; lng: number } | null;
}) {
  if (!MAPBOX_TOKEN) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    access_token: MAPBOX_TOKEN,
    language: "pt-BR",
    country: "BR",
    limit: "5"
  });

  if (proximity) {
    params.set("proximity", `${proximity.lng},${proximity.lat}`);
  }

  const url = `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`;
  const response = await mapboxFetch<ForwardGeocodeResponse>(url);

  return (response.features ?? [])
    .map((feature) => toRetrievedSuggestion(feature, feature.id ?? query))
    .filter((entry): entry is SearchSuggestion => entry !== null)
    .map<SearchAutocompleteSuggestion>((entry) => ({
      ...entry,
      source: "mapbox"
    }));
}

export const mapboxSearchProvider: SearchProvider = {
  name: "mapbox",
  async suggest(input) {
    if (!MAPBOX_TOKEN) {
      return [];
    }

    const variants = buildQueryVariants(input.query).slice(0, 5);
    const results = await Promise.all(
      variants.map(async (variant) => {
        const [suggestions, forwardResults] = await Promise.all([
          suggestVariant({ ...input, query: variant }).catch(() => []),
          forwardVariant({ query: variant, proximity: input.proximity }).catch(() => [])
        ]);

        return [...suggestions, ...forwardResults];
      })
    );

    const requestedType = inferRequestedType(input.query);
    const boosted = results.flat().map((result) => ({
      ...result,
      type: result.type === "poi" && requestedType !== "poi" ? requestedType : result.type
    }));

    return dedupeAndRank({
      query: input.query,
      results: boosted,
      proximity: input.proximity,
      limit: 8,
      minScore: 14
    });
  },
  async retrieve({ id, sessionToken }) {
    if (!MAPBOX_TOKEN) {
      return null;
    }

    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      session_token: sessionToken,
      language: "pt-BR"
    });
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(id)}?${params.toString()}`;
    const response = await mapboxFetch<SearchBoxRetrieveResponse>(url);
    const feature = response.features?.[0];

    return feature ? toRetrievedSuggestion(feature, id) : null;
  }
};
