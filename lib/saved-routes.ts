import { RouteResult } from "@/lib/types";

export const SAVED_ROUTES_STORAGE_KEY = "rota6.saved-routes.v1";
export const SAVED_ROUTES_EVENT = "rota6:saved-routes-updated";

export interface SavedRouteRecord {
  id: string;
  ownerId: string;
  title: string;
  origin: string;
  destination: string;
  stops: string[];
  route: RouteResult;
  updatedAt: string;
}

function dispatchSavedRoutesEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SAVED_ROUTES_EVENT));
  }
}

export function readSavedRoutes() {
  if (typeof window === "undefined") {
    return [] as SavedRouteRecord[];
  }

  const raw = window.localStorage.getItem(SAVED_ROUTES_STORAGE_KEY);
  if (!raw) {
    return [] as SavedRouteRecord[];
  }

  try {
    const parsed = JSON.parse(raw) as SavedRouteRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as SavedRouteRecord[];
  }
}

function saveAllSavedRoutes(records: SavedRouteRecord[]) {
  window.localStorage.setItem(SAVED_ROUTES_STORAGE_KEY, JSON.stringify(records));
  dispatchSavedRoutesEvent();
}

export function upsertSavedRoute(record: SavedRouteRecord) {
  const existing = readSavedRoutes();
  const next = [record, ...existing.filter((entry) => entry.id !== record.id)];
  saveAllSavedRoutes(next);
  return record;
}

export function deleteSavedRoute(recordId: string) {
  const existing = readSavedRoutes();
  saveAllSavedRoutes(existing.filter((entry) => entry.id !== recordId));
}

export function findSavedRoute(recordId: string) {
  return readSavedRoutes().find((entry) => entry.id === recordId) ?? null;
}
