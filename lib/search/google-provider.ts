import { SearchAutocompleteSuggestion, SearchResultType, SearchSuggestion } from "@/lib/rebuild/types";
import { buildQueryVariants, inferRequestedType } from "@/lib/search/normalize";
import { SearchProvider, SearchProviderSuggestInput } from "@/lib/search/providers";
import { dedupeAndRank } from "@/lib/search/ranking";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface AutocompleteResponse {
  predictions?: Array<{
    place_id?: string;
    description?: string;
    structured_formatting?: {
      main_text?: string;
    };
    types?: string[];
  }>;
  status?: string;
}

interface PlaceDetailsResponse {
  result?: {
    place_id?: string;
    name?: string;
    formatted_address?: string;
    geometry?: {
      location?: { lat?: number; lng?: number };
    };
    types?: string[];
  };
  status?: string;
}

function classifyGoogleTypes(types?: string[]): SearchResultType {
  if (!types?.length) return "poi";
  const text = types.join(" ");

  if (text.includes("locality") || text.includes("administrative_area") || text.includes("country")) return "city";
  if (text.includes("street_address") || text.includes("premise") || text.includes("subpremise")) return "address";
  if (text.includes("lodging")) return "hotel";
  if (text.includes("restaurant") || text.includes("food")) return "restaurant";
  if (text.includes("bar")) return "bar";
  if (text.includes("gas_station")) return "fuel";
  if (text.includes("car_repair")) return "repair";
  if (
    text.includes("tourist_attraction") ||
    text.includes("natural_feature") ||
    text.includes("park") ||
    text.includes("museum")
  )
    return "tourism";
  if (text.includes("route") || text.includes("street_number")) return "address";

  return "poi";
}

async function autocomplete(
  query: string,
  proximity?: { lat: number; lng: number } | null
): Promise<SearchAutocompleteSuggestion[]> {
  if (!GOOGLE_API_KEY) return [];

  const params = new URLSearchParams({
    input: query,
    key: GOOGLE_API_KEY,
    language: "pt-BR",
    components: "country:br"
  });

  if (proximity) {
    params.set("location", `${proximity.lat},${proximity.lng}`);
    params.set("radius", "50000");
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 0 } });

  if (!response.ok) return [];

  const data = (await response.json()) as AutocompleteResponse;

  return (data.predictions ?? [])
    .filter((p) => p.place_id && p.description)
    .map<SearchAutocompleteSuggestion>((p) => ({
      id: `google-${p.place_id!}`,
      name: p.structured_formatting?.main_text ?? p.description!,
      fullAddress: p.description!,
      source: "google",
      type: classifyGoogleTypes(p.types)
    }));
}

export const googleSearchProvider: SearchProvider = {
  name: "google",

  async suggest(input: SearchProviderSuggestInput): Promise<SearchAutocompleteSuggestion[]> {
    if (!GOOGLE_API_KEY) return [];

    const variants = buildQueryVariants(input.query).slice(0, 3);
    const batches = await Promise.all(variants.map((v) => autocomplete(v, input.proximity).catch(() => [])));

    const requestedType = inferRequestedType(input.query);
    const boosted = batches.flat().map((result) => ({
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

  async retrieve({ id }): Promise<SearchSuggestion | null> {
    if (!GOOGLE_API_KEY) return null;

    const placeId = id.startsWith("google-") ? id.slice(7) : id;

    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_API_KEY,
      language: "pt-BR",
      fields: "place_id,name,formatted_address,geometry,types"
    });

    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
    const response = await fetch(url, { next: { revalidate: 0 } });

    if (!response.ok) return null;

    const data = (await response.json()) as PlaceDetailsResponse;
    const result = data.result;

    if (!result?.geometry?.location) return null;

    return {
      id: `google-${result.place_id ?? placeId}`,
      name: result.name ?? result.formatted_address ?? "Local",
      fullAddress: result.formatted_address ?? result.name ?? "Local",
      lat: result.geometry.location.lat ?? 0,
      lng: result.geometry.location.lng ?? 0,
      source: "google",
      type: classifyGoogleTypes(result.types),
      providerPlaceId: result.place_id
    };
  }
};
