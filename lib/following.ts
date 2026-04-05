const STORAGE_KEY = "rota6-following";

export type FollowingState = Record<string, string[]>;

export function readFollowing(defaultValue: FollowingState): FollowingState {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(raw) as FollowingState;
    return parsed;
  } catch {
    return defaultValue;
  }
}

export function saveFollowing(value: FollowingState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
