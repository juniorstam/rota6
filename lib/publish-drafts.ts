"use client";

import { TripRoadLevel, TripType } from "@/lib/types";

export const PUBLISH_DRAFTS_STORAGE_KEY = "rota6.publish-drafts.v1";
export const PUBLISH_DRAFTS_EVENT = "rota6:publish-drafts-updated";

type DraftStopType = "parada" | "combustivel" | "paisagem" | "hospedagem";
type Visibility = "public" | "private" | "unlisted";

export interface StoredDraftStop {
  id: string;
  label: string;
  type: DraftStopType;
  notes: string;
}

export interface StoredDraftPhoto {
  id: string;
  name: string;
  previewUrl: string;
}

export interface PublishDraftRecord {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  origin: string;
  destination: string;
  tripType: TripType;
  roadLevel: TripRoadLevel;
  visibility: Visibility;
  tags: string;
  tips: string;
  stops: StoredDraftStop[];
  coverPhoto: StoredDraftPhoto | null;
  galleryPhotos: StoredDraftPhoto[];
  updatedAt: string;
}

export function readPublishDrafts() {
  if (typeof window === "undefined") {
    return [] as PublishDraftRecord[];
  }

  const raw = window.localStorage.getItem(PUBLISH_DRAFTS_STORAGE_KEY);
  if (!raw) {
    return [] as PublishDraftRecord[];
  }

  try {
    const parsed = JSON.parse(raw) as PublishDraftRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as PublishDraftRecord[];
  }
}

function saveAllDrafts(records: PublishDraftRecord[]) {
  window.localStorage.setItem(PUBLISH_DRAFTS_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(PUBLISH_DRAFTS_EVENT));
}

export function upsertPublishDraft(record: PublishDraftRecord) {
  const existing = readPublishDrafts();
  const withoutCurrent = existing.filter((entry) => entry.id !== record.id);
  saveAllDrafts([record, ...withoutCurrent]);
}

export function deletePublishDraft(draftId: string) {
  const existing = readPublishDrafts();
  saveAllDrafts(existing.filter((entry) => entry.id !== draftId));
}

export function findPublishDraft(draftId: string) {
  return readPublishDrafts().find((entry) => entry.id === draftId) ?? null;
}
