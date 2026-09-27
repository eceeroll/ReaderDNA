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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={clsx(
        size === "lg" ? "size-11" : size === "md" ? "size-5" : "size-3.5",
        filled ? "text-warm" : size === "lg" ? "text-warm/30" : "text-ink-muted",
      )}
    >
      <path d="M12 3.2l2.4 5.4 5.9.6-4.4 3.9 1.3 5.7L12 16.2 6.8 18.8l1.3-5.7L3.7 9.2l5.9-.6L12 3.2z" />
    </svg>
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
