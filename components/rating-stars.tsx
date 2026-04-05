import { Star } from "lucide-react";

export function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(value);
        return (
          <Star
            key={index}
            size={14}
            className={filled ? "fill-accent text-accent" : "text-border"}
          />
        );
      })}
    </div>
  );
}
