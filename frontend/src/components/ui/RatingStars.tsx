import { Star } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

function StarIcon({
  filled,
  size,
}: {
  filled: boolean;
  size: "sm" | "md" | "lg";
}) {
  return (
    <Star
      strokeWidth={1.75}
      aria-hidden
      className={clsx(
        size === "lg" ? "size-11" : size === "md" ? "size-5" : "size-3.5",
        filled
          ? "fill-current text-warm"
          : size === "lg"
            ? "text-warm/30"
            : "text-ink-muted",
      )}
    />
  );
}

export function RatingStars({
  rating,
  onRate,
  disabled = false,
  size = "sm",
}: {
  rating: number | null;
  onRate?: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? rating;
  const rowClassName = clsx(
    "inline-flex items-center",
    size === "lg" ? "gap-3" : size === "md" ? "gap-1" : "gap-0.5",
  );

  if (!onRate) {
    return (
      <div
        className={rowClassName}
        role="img"
        aria-label={
          rating === null ? "No rating" : `Rated ${rating} out of 5`
        }
      >
        {STAR_VALUES.map((value) => (
          <StarIcon
            key={value}
            size={size}
            filled={rating !== null && value <= rating}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={rowClassName} role="group" aria-label="Rating">
      {STAR_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          aria-label={`Rate ${value} out of 5`}
          disabled={disabled}
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onRate(value)}
          className={clsx(
            "inline-flex cursor-pointer items-center justify-center rounded-full focus-visible:shadow-[0_0_0_3px_var(--color-warm-tint)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-soft",
            size === "lg"
              ? "motion-safe:hover:scale-110"
              : "motion-safe:hover:scale-[1.02]",
          )}
        >
          <StarIcon size={size} filled={shown !== null && value <= shown} />
        </button>
      ))}
    </div>
  );
}
