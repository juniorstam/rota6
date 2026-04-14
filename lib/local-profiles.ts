import { users } from "@/lib/mock-data";
import { safeSetLocalStorageItem } from "@/lib/storage-utils";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { UserProfile } from "@/lib/types";

export const SESSION_STORAGE_KEY = "rota6-session";
export const LOCAL_USERS_STORAGE_KEY = "rota6-local-users";
export const LOCAL_PROFILES_EVENT = "rota6-local-profiles-updated";

const DEFAULT_COVER_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 640">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff3e6" />
          <stop offset="45%" stop-color="#ffe3c2" />
          <stop offset="100%" stop-color="#f4efe8" />
        </linearGradient>
      </defs>
      <rect width="1600" height="640" fill="url(#bg)" />
      <circle cx="1320" cy="120" r="180" fill="rgba(255,122,26,0.18)" />
      <circle cx="260" cy="520" r="220" fill="rgba(14,60,110,0.08)" />
      <path d="M0 470 C260 390 360 580 700 500 C980 432 1110 302 1600 410 L1600 640 L0 640 Z" fill="rgba(255,255,255,0.58)" />
    </svg>
  `);

function createInitialsAvatar(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "R6";

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="avatar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff8f3d" />
            <stop offset="100%" stop-color="#ff6a00" />
          </linearGradient>
        </defs>
        <rect width="240" height="240" rx="120" fill="url(#avatar)" />
        <text
          x="120"
          y="132"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="88"
          font-weight="700"
          fill="#ffffff"
        >
          ${initials}
        </text>
      </svg>
    `)
  );
}

export function normalizeUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function dispatchProfilesEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOCAL_PROFILES_EVENT));
  }
}

export function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveSession(user: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  safeSetLocalStorageItem(SESSION_STORAGE_KEY, user);
  dispatchProfilesEvent();
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  dispatchProfilesEvent();
}

export function readLocalUsers() {
  if (typeof window === "undefined") {
    return [] as UserProfile[];
  }

  const raw = window.localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
  if (!raw) {
    return [] as UserProfile[];
  }

  try {
    const parsed = JSON.parse(raw) as UserProfile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as UserProfile[];
  }
}

function saveLocalUsers(nextUsers: UserProfile[]) {
  safeSetLocalStorageItem(LOCAL_USERS_STORAGE_KEY, nextUsers);
  dispatchProfilesEvent();
}

export function createBlankProfile({
  email,
  name,
  username
}: {
  email: string;
  name: string;
  username: string;
}): UserProfile {
  return {
    id: crypto.randomUUID(),
    username,
    email,
    name,
    avatarUrl: createInitialsAvatar(name),
    coverUrl: DEFAULT_COVER_URL,
    city: "",
    state: "",
    region: "",
    motorcycle: "",
    motorcycleBrand: "",
    motorcycleModel: "",
    bio: "",
    travelStyle: "solo",
    contactEmail: email,
    phone: "",
    instagramHandle: "",
    publishedTripsCount: 0,
    publishedRecommendationsCount: 0
  };
}

export function getMergedProfiles() {
  if (typeof window === "undefined") {
    return users;
  }

  if (hasSupabaseEnv()) {
    return readLocalUsers();
  }

  const map = new Map<string, UserProfile>();

  [...readLocalUsers(), ...users].forEach((profile) => {
    const key = normalizeUsername(profile.username);
    if (!map.has(key)) {
      map.set(key, profile);
    }
  });

  return Array.from(map.values());
}

export function findProfileByUsername(username: string) {
  const normalized = normalizeUsername(username);
  return getMergedProfiles().find((profile) => normalizeUsername(profile.username) === normalized) ?? null;
}

export function upsertLocalUser(nextUser: UserProfile) {
  const currentUsers = readLocalUsers();
  const nextUsers = [
    nextUser,
    ...currentUsers.filter((user) => normalizeUsername(user.username) !== normalizeUsername(nextUser.username))
  ];

  saveLocalUsers(nextUsers);

  const session = getStoredSession();
  if (session?.id === nextUser.id) {
    saveSession(nextUser);
  }

  return nextUser;
}

export function usernameExists(username: string, excludeUserId?: string) {
  const normalized = normalizeUsername(username);
  return getMergedProfiles().some(
    (profile) =>
      normalizeUsername(profile.username) === normalized && (!excludeUserId || profile.id !== excludeUserId)
  );
}

export function buildMotorcycleLabel(brand: string, model: string) {
  return [brand.trim(), model.trim()].filter(Boolean).join(" ");
}

export function getDefaultCoverUrl() {
  return DEFAULT_COVER_URL;
}
