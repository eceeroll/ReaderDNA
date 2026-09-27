import clsx from "clsx";
import type { BookSearchResult } from "../../api/books";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FieldError } from "../ui/FieldError";
import { BookCoverInfo } from "./BookCoverInfo";

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
  return (
    <Card
      variant="interactive"
      className={clsx(
        "group flex h-full flex-col",
        compact && "p-4!",
        className,
      )}
    >
      <BookCoverInfo book={book} compact={compact} />

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
