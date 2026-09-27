import clsx from "clsx";
import { useEffect, useState } from "react";
import type { BookSearchResult } from "../../api/books";
import type { ReadStatus } from "../../api/library";
import { Card } from "../ui/Card";
import { FieldError } from "../ui/FieldError";
import { LibraryMenu } from "../ui/LibraryMenu";
import { BookCoverInfo } from "./BookCoverInfo";
import { RateBookDialog } from "./RateBookDialog";

export type BookCardLibraryEntry = {
  id: number;
  status: ReadStatus;
  rating: number | null;
};

export function BookCard({
  book,
  isUpdating,
  isRating,
  libraryEntry,
  addError,
  onStatusChange,
  onRate,
  compact = false,
  className,
}: {
  book: BookSearchResult;
  isUpdating: boolean;
  isRating: boolean;
  libraryEntry: BookCardLibraryEntry | null;
  addError: string | null;
  onStatusChange: (googleBooksId: string, status: ReadStatus) => void;
  onRate: (libraryEntryId: number, rating: number) => void | Promise<void>;
  compact?: boolean;
  className?: string;
}) {
  const [rateOpen, setRateOpen] = useState(false);

  useEffect(() => {
    if (rateOpen && addError && libraryEntry?.status !== "READ") {
      setRateOpen(false);
    }
  }, [addError, libraryEntry?.status, rateOpen]);

  function handleSelect(status: ReadStatus) {
    if (libraryEntry?.status !== status) {
      onStatusChange(book.googleBooksId, status);
    }
    if (status === "READ") {
      setRateOpen(true);
    }
  }

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
        <LibraryMenu
          status={libraryEntry?.status ?? null}
          disabled={isUpdating}
          onSelect={handleSelect}
        />
        {addError !== null && (
          <FieldError className="mt-2" message={addError} align="start" />
        )}
      </div>

      <RateBookDialog
        open={rateOpen}
        initialRating={libraryEntry?.rating ?? null}
        canSave={libraryEntry !== null}
        isSaving={isRating}
        onClose={() => setRateOpen(false)}
        onSave={async (rating) => {
          if (!libraryEntry) {
            throw new Error("This book is not in your library yet.");
          }
          await onRate(libraryEntry.id, rating);
          setRateOpen(false);
        }}
      />
    </Card>
  );
}
