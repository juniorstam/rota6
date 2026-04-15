"use client";

const KNOWN_STORAGE_KEYS = [
  "rota6-session",
  "rota6-local-users",
  "rota6-following",
  "rota6.publish-drafts.v1",
  "rota6.published-trips.v1"
] as const;

const LEGACY_LOCAL_MODE_KEYS = ["rota6-local-users", "rota6.published-trips.v1", "rota6-following"] as const;

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("data:image/") && value.length > 50_000) {
      return "";
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeValue(entry)])
    );
  }

  return value;
}

export function cleanupKnownStorageEntries() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of KNOWN_STORAGE_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeValue(parsed);
      window.localStorage.setItem(key, JSON.stringify(sanitized));
    } catch {
      window.localStorage.removeItem(key);
    }
  }
}

export function clearLegacyLocalModeData() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of LEGACY_LOCAL_MODE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export function sanitizeForStorage<T>(value: T): T {
  return sanitizeValue(value) as T;
}

export function safeSetLocalStorageItem(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(sanitizeForStorage(value));

  try {
    window.localStorage.setItem(key, serialized);
    return;
  } catch (error) {
    cleanupKnownStorageEntries();
  }

  try {
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`Nao foi possivel persistir ${key} no localStorage.`, error);
  }
}
