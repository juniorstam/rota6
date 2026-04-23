import { SearchAutocompleteSuggestion } from "@/lib/rebuild/types";
import { SearchProvider } from "@/lib/search/providers";
import { dedupeAndRank } from "@/lib/search/ranking";

const reviewedPlaces: SearchAutocompleteSuggestion[] = [];

export const rota6SearchProvider: SearchProvider = {
  name: "rota6",
  async suggest({ query, proximity }) {
    return dedupeAndRank({
      query,
      results: reviewedPlaces.map((place) => ({
        ...place,
        source: "rota6",
        type: "rota6_place"
      })),
      proximity,
      limit: 6,
      minScore: 18
    });
  }
};
