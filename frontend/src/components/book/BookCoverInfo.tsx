import { Star } from "lucide-react";
import clsx from "clsx";

export type BookCoverInfoBook = {
  title: string;
  author: string;
  coverImageUrl: string | null;
  averageRating: number | null;
  genres: string[];
};

export function BookCoverInfo({
  book,
  compact = false,
}: {
  book: BookCoverInfoBook;
  compact?: boolean;
}) {
  const genre = compact
    ? undefined
    : book.genres.find((value) => value.trim().length > 0);

  return (
    <>
      <div className="aspect-2/3 overflow-hidden rounded-md bg-surface">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-soft motion-safe:group-hover:scale-[1.02]"
          />
        ) : null}
      </div>

      <h3
        className={clsx(
          "line-clamp-2 font-sans leading-snug font-semibold text-ink",
          compact ? "mt-3 min-h-11 text-base" : "mt-4 min-h-12 text-lg",
        )}
      >
        {book.title}
      </h3>
      <p className="mt-2 truncate font-sans text-[13px] leading-normal text-ink-muted">
        {book.author}
      </p>

      <div className="mt-3 flex min-h-7 items-center gap-2">
        {book.averageRating !== null && (
          <span className="inline-flex shrink-0 items-center gap-1 font-sans text-[13px] font-medium text-ink">
            <Star
              size={14}
              strokeWidth={1.75}
              aria-hidden
              className="fill-current text-warm"
            />
            {book.averageRating.toFixed(1)}
          </span>
        )}
        {genre && (
          <span className="ml-auto min-w-0 truncate rounded-sm bg-surface px-2 py-1 font-sans text-[13px] text-ink-muted">
            {genre}
          </span>
        )}
      </div>
    </>
  );
}
