import { SearchAutocompleteSuggestion } from "@/lib/rebuild/types";
import { buildQueryVariants, inferRequestedType } from "@/lib/search/normalize";
import { SearchProvider } from "@/lib/search/providers";
import { dedupeAndRank } from "@/lib/search/ranking";

interface NominatimFeature {
  place_id?: number;
  lat?: string;
  lon?: string;
  name?: string;
  display_name?: string;
  type?: string;
  class?: string;
}

async function nominatimFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      "User-Agent": "Rota6/1.0 (hybrid route planner search fallback)"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function classifyNominatim(feature: NominatimFeature, query: string) {
  if (feature.class === "place" && ["city", "town", "municipality", "village"].includes(feature.type ?? "")) {
    return "city";
  }

  if (feature.class === "highway" || feature.class === "building") {
    return "address";
  }

  return inferRequestedType(query);
}

export const nominatimSearchProvider: SearchProvider = {
  name: "nominatim",
  async suggest({ query, proximity }) {
    const variants = buildQueryVariants(query).slice(0, 4);
    const batches = await Promise.all(
      variants.map(async (variant) => {
        const params = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          limit: "7",
          countrycodes: "br",
          q: variant
        });
        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        return nominatimFetch<NominatimFeature[]>(url).catch(() => []);
      })
    );

    const results = batches
      .flat()
      .map<SearchAutocompleteSuggestion | null>((feature, index) => {
        const lat = feature.lat ? Number(feature.lat) : NaN;
        const lng = feature.lon ? Number(feature.lon) : NaN;

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }

        const fullAddress = feature.display_name ?? feature.name ?? "Local";
        const name = feature.name ?? fullAddress.split(",")[0] ?? "Local";

        return {
          id: `nominatim-${feature.place_id ?? index}-${lat}-${lng}`,
          name,
          fullAddress,
          lat,
          lng,
          source: "nominatim",
          type: classifyNominatim(feature, query)
        };
      })
      .filter((entry): entry is SearchAutocompleteSuggestion => entry !== null);

    return dedupeAndRank({
      query,
      results,
      proximity,
      limit: 8,
      minScore: 50
    });
  }
};
