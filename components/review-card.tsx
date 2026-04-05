import { ThumbsUp } from "lucide-react";

import { RatingStars } from "@/components/rating-stars";
import { PlaceReview } from "@/lib/types";

export function ReviewCard({ review }: { review: PlaceReview }) {
  return (
    <article className="rounded-[24px] border border-border bg-surfaceAlt p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-text">{review.userName}</p>
          <p className="text-sm text-muted">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-text">{review.rating.toFixed(1)}</p>
          <RatingStars value={review.rating} />
        </div>
      </div>

      <p className="text-sm leading-6 text-muted">{review.comment}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-background px-3 py-1">
          moto segura: {review.safeForMotorcycle ? "sim" : "não"}
        </span>
        <span className="rounded-full bg-background px-3 py-1">
          grupo: {review.goodForGroups ? "sim" : "não"}
        </span>
        <span className="rounded-full bg-background px-3 py-1">preço: {review.pricePerception}</span>
        <span className="rounded-full bg-background px-3 py-1">estrutura: {review.travelerStructure}</span>
        {review.wouldRecommend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-success">
            <ThumbsUp size={12} />
            recomendaria
          </span>
        )}
      </div>
    </article>
  );
}
