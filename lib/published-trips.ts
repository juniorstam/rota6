"use client";

import { PublishedTrip, TripRoadLevel, TripType, UserProfile } from "@/lib/types";
import { sanitizeTripCoverUrl } from "@/lib/trip-images";
import { safeSetLocalStorageItem } from "@/lib/storage-utils";

export const PUBLISHED_TRIPS_STORAGE_KEY = "rota6.published-trips.v1";
export const PUBLISHED_TRIPS_EVENT = "rota6:published-trips-updated";

const FALLBACK_COVER_URL =
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80";
const FALLBACK_GALLERY_URL =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

type DraftStopType = "parada" | "combustivel" | "paisagem" | "hospedagem";
type Visibility = "public" | "private" | "unlisted";

export interface PublishedTripRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  origin: string;
  destination: string;
  tripType: TripType;
  roadLevel: TripRoadLevel;
  visibility: Visibility;
  tags: string[];
  tips: string[];
  stops: Array<{ label: string; type: DraftStopType; notes: string }>;
  coverPhotoName: string | null;
  galleryPhotoNames: string[];
  coverPhotoUrl?: string | null;
  galleryPhotoUrls?: string[];
  author: Pick<UserProfile, "id" | "username" | "name" | "avatarUrl" | "motorcycle">;
  publishedAt: string;
}

type LegacyPublishedTripRecord = Partial<PublishedTripRecord> & {
  authorName?: string;
};

function normalizeRecord(record: LegacyPublishedTripRecord): PublishedTripRecord | null {
  if (!record || !record.id || !record.slug || !record.title || !record.origin || !record.destination) {
    return null;
  }

  const fallbackAuthorName = record.authorName ?? "Usuario local";

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary ?? "",
    origin: record.origin,
    destination: record.destination,
    tripType: record.tripType ?? "solo",
    roadLevel: record.roadLevel ?? "tranquila",
    visibility: record.visibility ?? "public",
    tags: Array.isArray(record.tags) ? record.tags : [],
    tips: Array.isArray(record.tips) ? record.tips : [],
    stops: Array.isArray(record.stops) ? record.stops : [],
    coverPhotoName: record.coverPhotoName ?? null,
    galleryPhotoNames: Array.isArray(record.galleryPhotoNames) ? record.galleryPhotoNames : [],
    coverPhotoUrl: typeof record.coverPhotoUrl === "string" ? record.coverPhotoUrl : null,
    galleryPhotoUrls: Array.isArray(record.galleryPhotoUrls) ? record.galleryPhotoUrls : [],
    author: record.author ?? {
      id: "local-user",
      username: "usuario-local",
      name: fallbackAuthorName,
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      motorcycle: "Moto nao informada"
    },
    publishedAt: record.publishedAt ?? new Date().toISOString()
  };
}

export function readPublishedTripRecords(): PublishedTripRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(PUBLISHED_TRIPS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LegacyPublishedTripRecord[];
    return Array.isArray(parsed) ? parsed.map(normalizeRecord).filter((entry): entry is PublishedTripRecord => Boolean(entry)) : [];
  } catch {
    return [];
  }
}

export function savePublishedTripRecord(record: PublishedTripRecord) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readPublishedTripRecords();
  safeSetLocalStorageItem(PUBLISHED_TRIPS_STORAGE_KEY, [record, ...existing]);
  window.dispatchEvent(new Event(PUBLISHED_TRIPS_EVENT));
}

export function updatePublishedTripRecord(
  tripId: string,
  updater: (record: PublishedTripRecord) => PublishedTripRecord
) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readPublishedTripRecords();
  const nextRecords = existing.map((record) => (record.id === tripId ? updater(record) : record));
  safeSetLocalStorageItem(PUBLISHED_TRIPS_STORAGE_KEY, nextRecords);
  window.dispatchEvent(new Event(PUBLISHED_TRIPS_EVENT));
}

export function deletePublishedTripRecord(tripId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readPublishedTripRecords();
  const nextRecords = existing.filter((record) => record.id !== tripId);
  safeSetLocalStorageItem(PUBLISHED_TRIPS_STORAGE_KEY, nextRecords);
  window.dispatchEvent(new Event(PUBLISHED_TRIPS_EVENT));
}

export function findPublishedTripRecord(username: string, slug: string): PublishedTripRecord | null {
  return (
    readPublishedTripRecords().find(
      (entry) => entry.author.username === username && entry.slug === slug
    ) ?? null
  );
}

export function recordToPublishedTrip(record: PublishedTripRecord): PublishedTrip {
  const galleryPhotos =
    record.galleryPhotoUrls && record.galleryPhotoUrls.length
      ? record.galleryPhotoUrls
      : Array.from({ length: Math.max(record.galleryPhotoNames.length, 1) }, () => FALLBACK_GALLERY_URL);

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    origin: record.origin,
    destination: record.destination,
    summary: record.summary,
    coverUrl: sanitizeTripCoverUrl(record.coverPhotoUrl || galleryPhotos[0] || FALLBACK_COVER_URL),
    photos: galleryPhotos,
    tags: record.tags,
    routeStops: record.stops.map((stop, index) => ({
      id: `${record.id}-stop-${index + 1}`,
      name: stop.label,
      city: "",
      state: "",
      type: stop.type,
      notes: stop.notes || undefined
    })),
    tips: record.tips,
    roadLevel: record.roadLevel,
    tripType: record.tripType,
    publicVisibility: record.visibility === "public",
    author: record.author,
    distanceKm: 0,
    durationHours: 0,
    commentsCount: 0
  };
}

export function readPublishedTrips(): PublishedTrip[] {
  return readPublishedTripRecords().map(recordToPublishedTrip);
}

export function findPublishedTrip(username: string, slug: string): PublishedTrip | null {
  const trip = readPublishedTrips().find(
    (entry) => entry.author.username === username && entry.slug === slug
  );
  return trip ?? null;
}
