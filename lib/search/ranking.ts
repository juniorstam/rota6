import { SearchAutocompleteSuggestion, SearchSuggestion } from "@/lib/rebuild/types";
import { normalizeSearchText, tokenizeSearch } from "@/lib/search/normalize";

type RankableSuggestion = SearchSuggestion | SearchAutocompleteSuggestion;

function distanceKm(a?: { lat: number; lng: number } | null, b?: { lat?: number; lng?: number } | null) {
  if (!a || !b || b.lat === undefined || b.lng === undefined) {
    return null;
  }

  const radiusKm = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * radiusKm * Math.asin(Math.sqrt(h));
}

export function scoreSearchResult({
  query,
  result,
  proximity
}: {
  query: string;
  result: RankableSuggestion;
  proximity?: { lat: number; lng: number } | null;
}) {
  const normalizedQuery = normalizeSearchText(query);
  const name = normalizeSearchText(result.name);
  const address = normalizeSearchText(result.fullAddress);
  const haystack = `${name} ${address}`;
  const tokens = tokenizeSearch(query);
  let score = 0;

  if (name === normalizedQuery) {
    score += 120;
  } else if (name.startsWith(normalizedQuery)) {
    score += 86;
  } else if (name.includes(normalizedQuery)) {
    score += 68;
  } else if (address.includes(normalizedQuery)) {
    score += 38;
  }

  tokens.forEach((token) => {
    if (name === token) {
      score += 28;
    } else if (name.startsWith(token)) {
      score += 18;
    } else if (name.includes(token)) {
      score += 12;
    } else if (address.includes(token)) {
      score += 5;
    }
  });

  if (tokens.length > 1 && tokens.every((token) => haystack.includes(token))) {
    score += 35;
  }

  if (result.type === "city") {
    score += 34;
  } else if (result.type === "rota6_place") {
    score += 24;
  } else if (["hotel", "restaurant", "bar", "fuel", "repair", "tourism"].includes(result.type ?? "")) {
    score += 18;
  }

  if (result.source === "municipality") {
    score += 26;
  }

  const km = distanceKm(proximity, result);
  if (km !== null) {
    score += Math.max(0, 18 - Math.min(km / 45, 18));
  }

  return score;
}

export function dedupeAndRank<T extends RankableSuggestion>({
  query,
  results,
  proximity,
  limit = 8,
  minScore = 18
}: {
  query: string;
  results: T[];
  proximity?: { lat: number; lng: number } | null;
  limit?: number;
  minScore?: number;
}) {
  const unique = new Map<string, T>();

  results.forEach((result) => {
    const key =
      result.lat !== undefined && result.lng !== undefined
        ? `${result.lat.toFixed(4)}:${result.lng.toFixed(4)}`
        : `${result.source}:${result.id}`;
    const current = unique.get(key);
    const resultScore = scoreSearchResult({ query, result, proximity });
    const currentScore = current ? scoreSearchResult({ query, result: current, proximity }) : -1;

    if (!current || resultScore > currentScore) {
      unique.set(key, { ...result, score: resultScore });
    }
  });

  return Array.from(unique.values())
    .filter((result) => scoreSearchResult({ query, result, proximity }) >= minScore)
    .sort((a, b) => scoreSearchResult({ query, result: b, proximity }) - scoreSearchResult({ query, result: a, proximity }))
    .slice(0, limit);
}
