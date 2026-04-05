import { FavoriteList } from "@/lib/types";

const STORAGE_KEY = "rota6-favorites";

export interface FavoriteItem {
  id: string;
  type: "place" | "trip";
  addedAt: string;
}

interface FavoriteState {
  items: FavoriteItem[];
  lists: FavoriteList[];
}

const defaultState: FavoriteState = {
  items: [],
  lists: [
    { id: "list-salvos", name: "Salvos", itemIds: [] },
    { id: "list-proxima", name: "Próxima viagem", itemIds: [] }
  ]
};

export function getFavoriteKey(type: "place" | "trip", id: string) {
  return `${type}:${id}`;
}

export function readFavorites(): FavoriteState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(raw) as FavoriteState;
    return {
      items: parsed.items ?? [],
      lists: parsed.lists?.length ? parsed.lists : defaultState.lists
    };
  } catch {
    return defaultState;
  }
}

export function saveFavorites(state: FavoriteState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
