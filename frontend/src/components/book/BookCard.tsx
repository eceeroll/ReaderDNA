import clsx from "clsx";
import type { BookSearchResult } from "../../api/books";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FieldError } from "../ui/FieldError";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="text-warm"
    >
      <path d="M12 3.2l2.4 5.4 5.9.6-4.4 3.9 1.3 5.7L12 16.2 6.8 18.8l1.3-5.7L3.7 9.2l5.9-.6L12 3.2z" />
    </svg>
  );
}

export function BookCard({
  book,
  isAdding,
  isAdded,
  addError,
  onAdd,
  compact = false,
  className,
}: {
  book: BookSearchResult;
  isAdding: boolean;
  isAdded: boolean;
  addError: string | null;
  onAdd: (googleBooksId: string) => void;
  compact?: boolean;
  className?: string;
}) {
  const genre = compact
    ? undefined
    : book.genres.find((value) => value.trim().length > 0);

  return (
    <Card
      variant="interactive"
      className={clsx(
        "group flex h-full flex-col",
        compact && "p-4!",
        className,
      )}
    >
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
          "line-clamp-2 font-display leading-snug font-semibold text-ink",
          compact
            ? "mt-3 min-h-11 text-base"
            : "mt-4 min-h-12 text-lg",
        )}
      >
        {book.title}
      </h3>
      <p className="mt-2 truncate font-sans text-[13px] leading-normal text-ink-muted">
        {book.author}
      </p>

      {(book.averageRating !== null || genre) && (
        <div className="mt-3 flex items-center gap-2">
          {book.averageRating !== null && (
            <span className="inline-flex shrink-0 items-center gap-1 font-sans text-[13px] font-medium text-ink">
              <StarIcon />
              {book.averageRating.toFixed(1)}
            </span>
          )}
          {genre && (
            <span className="ml-auto min-w-0 truncate rounded-sm bg-surface px-2 py-1 font-sans text-[13px] text-ink-muted">
              {genre}
            </span>
          )}
        </div>
      )}

      <div className={clsx("mt-auto", compact ? "pt-3" : "pt-4")}>
        {isAdded ? (
          <p className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-success-tint px-4 py-2 text-center font-sans text-[13px] text-success">
            <CheckIcon />
            In Your Library
          </p>
        ) : (
          <Button
            variant="secondary"
            type="button"
            className="w-full min-w-0 px-4!"
            disabled={isAdding || !book.googleBooksId}
            onClick={() => onAdd(book.googleBooksId)}
          >
            <span className="min-w-0 text-center whitespace-normal">
              {isAdding ? "Adding..." : "Add to Library"}
            </span>
          </Button>
        )}
        {addError !== null && (
          <FieldError className="mt-2" message={addError} align="start" />
        )}
      </div>
    </Card>
  );
}
