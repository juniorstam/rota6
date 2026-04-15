import { createSupabaseAdminClient } from "@/lib/supabase/server";

const FOLLOW_LABEL_PREFIX = "__follow__:";
const FOLLOW_BRAND = "__system__";
const FOLLOW_MODEL = "follow";

export type FollowMap = Record<string, string[]>;

function normalizeFollowMap(map: FollowMap) {
  return Object.fromEntries(
    Object.entries(map).map(([userId, followedIds]) => [userId, Array.from(new Set(followedIds))])
  );
}

function parseFollowedUserId(label: string | null) {
  if (!label?.startsWith(FOLLOW_LABEL_PREFIX)) {
    return null;
  }

  return label.slice(FOLLOW_LABEL_PREFIX.length) || null;
}

export async function listFollowMapFromDb(): Promise<FollowMap> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("motorcycles")
    .select("user_id, label, brand, model")
    .eq("brand", FOLLOW_BRAND)
    .eq("model", FOLLOW_MODEL);

  if (error) {
    throw error;
  }

  const nextMap: FollowMap = {};

  for (const row of data ?? []) {
    const followedUserId = parseFollowedUserId(row.label);
    if (!followedUserId) {
      continue;
    }

    nextMap[row.user_id] = [...(nextMap[row.user_id] ?? []), followedUserId];
  }

  return normalizeFollowMap(nextMap);
}

export async function ensureFollowingState({
  followerId,
  followedId,
  shouldFollow
}: {
  followerId: string;
  followedId: string;
  shouldFollow: boolean;
}) {
  if (!followerId || !followedId || followerId === followedId) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const followLabel = `${FOLLOW_LABEL_PREFIX}${followedId}`;

  const { data: existingRows, error: existingError } = await supabase
    .from("motorcycles")
    .select("id")
    .eq("user_id", followerId)
    .eq("brand", FOLLOW_BRAND)
    .eq("model", FOLLOW_MODEL)
    .eq("label", followLabel);

  if (existingError) {
    throw existingError;
  }

  if (shouldFollow) {
    if ((existingRows ?? []).length > 0) {
      return;
    }

    const { error: insertError } = await supabase.from("motorcycles").insert({
      user_id: followerId,
      label: followLabel,
      brand: FOLLOW_BRAND,
      model: FOLLOW_MODEL,
      is_primary: false
    } as never);

    if (insertError) {
      throw insertError;
    }

    return;
  }

  if ((existingRows ?? []).length === 0) {
    return;
  }

  const ids = existingRows.map((row) => row.id);
  const { error: deleteError } = await supabase.from("motorcycles").delete().in("id", ids);

  if (deleteError) {
    throw deleteError;
  }
}
