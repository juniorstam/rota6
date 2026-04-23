import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function savePlaceReview({
  placeId,
  userId,
  rating,
  comment,
  tags
}: {
  placeId: string;
  userId: string;
  rating: number;
  comment?: string;
  tags: string[];
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("place_reviews")
    .upsert(
      {
        place_id: placeId,
        user_id: userId,
        rating,
        comment: comment?.trim() || null,
        tags
      } as never,
      { onConflict: "place_id,user_id" }
    )
    .select("id,place_id,rating,comment,tags,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
