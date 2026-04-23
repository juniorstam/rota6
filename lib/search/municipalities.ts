import municipalitiesData from "@/data/brazil-municipalities.json";
import { SearchAutocompleteSuggestion, SearchSuggestion } from "@/lib/rebuild/types";
import { normalizeSearchText, tokenizeSearch } from "@/lib/search/normalize";
import { dedupeAndRank } from "@/lib/search/ranking";

type Municipality = {
  id: string;
  name: string;
  uf: string;
  state: string;
  lat: number;
  lng: number;
  slug: string;
  search: string;
  aliases: string[];
};

const municipalities = municipalitiesData as Municipality[];

function municipalityToSuggestion(city: Municipality): SearchSuggestion {
  return {
    id: `city-${city.id}`,
    name: city.name,
    fullAddress: `${city.name}, ${city.uf}, Brasil`,
    lat: city.lat,
    lng: city.lng,
    type: "city",
    source: "municipality"
  };
}

function cityMatches(query: string, city: Municipality) {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = tokenizeSearch(query);
  const fields = [city.search, city.slug.replace(/-/g, " "), ...city.aliases.map(normalizeSearchText)];

  if (fields.some((field) => field === normalizedQuery || field.startsWith(normalizedQuery))) {
    return true;
  }

  return tokens.length > 0 && tokens.every((token) => fields.some((field) => field.includes(token)));
}

export function searchBrazilianMunicipalities({
  query,
  proximity,
  limit = 6
}: {
  query: string;
  proximity?: { lat: number; lng: number } | null;
  limit?: number;
}): SearchAutocompleteSuggestion[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const candidates = municipalities
    .filter((city) => cityMatches(trimmed, city))
    .map<SearchAutocompleteSuggestion>((city) => ({
      ...municipalityToSuggestion(city),
      source: "municipality"
    }));

  return dedupeAndRank({
    query: trimmed,
    results: candidates,
    proximity,
    limit,
    minScore: 22
  });
}

export function findMunicipalityContext(query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const exact = municipalities.find((city) => {
    const cityName = normalizeSearchText(city.name);
    return normalizedQuery.includes(cityName) || normalizedQuery.includes(`${cityName} ${city.uf.toLowerCase()}`);
  });

  return exact ? municipalityToSuggestion(exact) : null;
}
