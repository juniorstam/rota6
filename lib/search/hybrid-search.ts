import { SearchAutocompleteSuggestion, SearchSuggestion } from "@/lib/rebuild/types";
import { googleSearchProvider } from "@/lib/search/google-provider";
import { searchBrazilianMunicipalities } from "@/lib/search/municipalities";
import { nominatimSearchProvider } from "@/lib/search/nominatim-provider";
import { normalizeSearchText } from "@/lib/search/normalize";
import { SearchProviderSuggestInput } from "@/lib/search/providers";
import { dedupeAndRank } from "@/lib/search/ranking";
import { rota6SearchProvider } from "@/lib/search/rota6-provider";

const externalProviders = [googleSearchProvider, rota6SearchProvider, nominatimSearchProvider];

export async function suggestHybridLocations(input: SearchProviderSuggestInput): Promise<SearchAutocompleteSuggestion[]> {
  const cityResults = searchBrazilianMunicipalities({
    query: input.query,
    proximity: input.proximity,
    limit: 8
  });

  const providerBatches = await Promise.all(
    externalProviders.map((provider) => provider.suggest(input).catch(() => []))
  );
  const normalizedQuery = normalizeSearchText(input.query);
  const exactCity = cityResults.find(
    (city) => normalizeSearchText(city.name) === normalizedQuery || normalizeSearchText(city.fullAddress).startsWith(normalizedQuery)
  );

  if (exactCity && (exactCity.score ?? 0) >= 180) {
    const strongExternalResults = providerBatches
      .flat()
      .filter((result) => result.source === "google" || result.type === "rota6_place")
      .slice(0, 3);

    return dedupeAndRank({
      query: input.query,
      results: [exactCity, ...strongExternalResults],
      proximity: input.proximity,
      limit: 5,
      minScore: 18
    });
  }

  return dedupeAndRank({
    query: input.query,
    results: [...cityResults, ...providerBatches.flat()],
    proximity: input.proximity,
    limit: 9,
    minScore: 18
  });
}

export async function retrieveHybridLocation({
  id,
  sessionToken
}: {
  id: string;
  sessionToken: string;
}): Promise<SearchSuggestion | null> {
  if (id.startsWith("city-")) {
    return null;
  }

  if (id.startsWith("nominatim-") || id.startsWith("rota6-")) {
    return null;
  }

  if (id.startsWith("google-")) {
    return googleSearchProvider.retrieve?.({ id, sessionToken }) ?? null;
  }

  return null;
}
