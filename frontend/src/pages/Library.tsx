import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  getLibrary,
  updateLibraryEntry,
  type ReadStatus,
  type UserLibraryEntry,
} from "../api/library";
import { LibraryBookCard } from "../components/book/LibraryBookCard";
import { RateBookDialog } from "../components/book/RateBookDialog";
import { Button } from "../components/ui/Button";
import { FieldError } from "../components/ui/FieldError";
import { ApiError } from "../lib/api-client";

/**
 * Approximate how many denser shelf cards (+ gap-4) fit on desktop.
 * Sections at or below this count skip "Show all"; longer sections still
 * keep horizontal scrolling in the preview shelf.
 */
const SHELF_SHOW_ALL_THRESHOLD = 8;

const SECTIONS: { status: ReadStatus; title: string }[] = [
  { status: "WANT_TO_READ", title: "Want to Read" },
  { status: "CURRENTLY_READING", title: "Currently Reading" },
  { status: "READ", title: "Read" },
];

function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function LibrarySection({
  title,
  count,
  items,
  expanded,
  onToggleExpanded,
  updatingEntryId,
  actionError,
  onStatusChange,
  onRequestRate,
}: {
  title: string;
  count: number;
  items: UserLibraryEntry[];
  expanded: boolean;
  onToggleExpanded: () => void;
  updatingEntryId: number | null;
  actionError: { id: number; message: string } | null;
  onStatusChange: (id: number, status: ReadStatus) => void;
  onRequestRate: (id: number) => void;
}) {
  const toggleWrapRef = useRef<HTMLDivElement>(null);
  const booksRef = useRef<HTMLDivElement>(null);
  const showToggle = items.length > SHELF_SHOW_ALL_THRESHOLD;

  function handleToggle() {
    if (expanded) {
      const active = document.activeElement;
      const focusInBooks =
        active instanceof HTMLElement &&
        (booksRef.current?.contains(active) ?? false);

      onToggleExpanded();

      if (focusInBooks) {
        queueMicrotask(() => {
          toggleWrapRef.current?.querySelector("button")?.focus();
        });
      }
      return;
    }

    onToggleExpanded();
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 font-sans text-2xl leading-tight font-semibold text-ink">
          {title} ({count})
        </h2>
        {showToggle && (
          <div ref={toggleWrapRef} className="shrink-0">
            <Button type="button" variant="ghost" onClick={handleToggle}>
              {expanded ? "Show less" : `Show all (${count})`}
            </Button>
          </div>
        )}
      </div>

      <div ref={booksRef}>
        {expanded ? (
          <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((entry) => (
              <li key={entry.id} className="min-w-0">
                <LibraryBookCard
                  entry={entry}
                  isUpdating={updatingEntryId === entry.id}
                  onStatusChange={onStatusChange}
                  onRequestRate={onRequestRate}
                  actionError={
                    actionError?.id === entry.id ? actionError.message : null
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex gap-4 overflow-x-auto py-3">
            {items.map((entry) => (
              <LibraryBookCard
                key={entry.id}
                entry={entry}
                className="w-36 shrink-0"
                isUpdating={updatingEntryId === entry.id}
                onStatusChange={onStatusChange}
                onRequestRate={onRequestRate}
                actionError={
                  actionError?.id === entry.id ? actionError.message : null
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Library() {
  const [items, setItems] = useState<UserLibraryEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{
    id: number;
    message: string;
  } | null>(null);
  const [updatingEntryId, setUpdatingEntryId] = useState<number | null>(null);
  const updatingEntryIdRef = useRef<number | null>(null);
  const [ratingEntryId, setRatingEntryId] = useState<number | null>(null);
  const ratingEntryIdRef = useRef<number | null>(null);
  const [rateEntryId, setRateEntryId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState<Record<ReadStatus, boolean>>({
    WANT_TO_READ: false,
    CURRENTLY_READING: false,
    READ: false,
  });

  useEffect(() => {
    let active = true;

    getLibrary()
      .then((library) => {
        if (!active) {
          return;
        }
        setItems(library.items);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setLoadError(errorMessage(error));
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleStatusChange(id: number, status: ReadStatus) {
    if (updatingEntryIdRef.current !== null) {
      return;
    }

    const current = items?.find((item) => item.id === id);
    if (!current) {
      return;
    }

    const previousStatus = current.status;
    updatingEntryIdRef.current = id;
    setUpdatingEntryId(id);
    setItems(
      (list) =>
        list?.map((item) => (item.id === id ? { ...item, status } : item)) ??
        null,
    );
    setActionError(null);

    try {
      await updateLibraryEntry(id, { status });
    } catch (error) {
      setItems(
        (list) =>
          list?.map((item) =>
            item.id === id ? { ...item, status: previousStatus } : item,
          ) ?? null,
      );
      setActionError({ id, message: errorMessage(error) });
    } finally {
      updatingEntryIdRef.current = null;
      setUpdatingEntryId(null);
    }
  }

  async function handleRatingChange(id: number, rating: number) {
    if (ratingEntryIdRef.current !== null) {
      throw new Error("Unable to save rating");
    }

    const current = items?.find((item) => item.id === id);
    if (!current) {
      throw new Error("Unable to save rating");
    }

    const previousRating = current.rating;
    ratingEntryIdRef.current = id;
    setRatingEntryId(id);
    setItems(
      (list) =>
        list?.map((item) => (item.id === id ? { ...item, rating } : item)) ??
        null,
    );
    setActionError(null);

    try {
      await updateLibraryEntry(id, { rating });
    } catch (error) {
      setItems(
        (list) =>
          list?.map((item) =>
            item.id === id ? { ...item, rating: previousRating } : item,
          ) ?? null,
      );
      setActionError({ id, message: errorMessage(error) });
      throw error;
    } finally {
      ratingEntryIdRef.current = null;
      setRatingEntryId(null);
    }
  }

  const isLoading = items === null && loadError === null;
  const sections =
    items === null
      ? []
      : SECTIONS.map((section) => ({
          ...section,
          items: items.filter((item) => item.status === section.status),
        })).filter((section) => section.items.length > 0);
  const rateEntry =
    items?.find((item) => item.id === rateEntryId && item.status === "READ") ??
    null;

  return (
    <div className="min-h-screen bg-page">
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 md:pt-8">
        <h1 className="font-display text-[32px] leading-[1.2] font-semibold text-ink">
          Your library
        </h1>
        <p className="mt-2 max-w-xl font-sans text-[15px] leading-[1.6] text-ink-muted">
          Grouped by what you want to read, what you are reading, and what you
          have finished.
        </p>

        {isLoading && (
          <p className="mt-8 font-sans text-[15px] text-ink-muted" aria-busy="true">
            Loading your library...
          </p>
        )}

        {loadError !== null && (
          <div className="mt-8">
            <FieldError message={loadError} align="start" />
          </div>
        )}

        {items !== null && items.length === 0 && (
          <div className="mt-8 max-w-xl">
            <p className="font-sans text-[15px] leading-[1.6] text-ink-muted">
              Your shelves are empty. Find a book on Discover and it will show
              up here.
            </p>
            <Link to="/discover" className="mt-6 inline-flex">
              <Button type="button">Browse Discover</Button>
            </Link>
          </div>
        )}

        {sections.length > 0 && (
          <div className="mt-8 flex flex-col gap-8">
            {sections.map((section) => (
              <LibrarySection
                key={section.status}
                title={section.title}
                count={section.items.length}
                items={section.items}
                expanded={showAll[section.status]}
                onToggleExpanded={() =>
                  setShowAll((current) => ({
                    ...current,
                    [section.status]: !current[section.status],
                  }))
                }
                updatingEntryId={updatingEntryId}
                actionError={actionError}
                onStatusChange={handleStatusChange}
                onRequestRate={setRateEntryId}
              />
            ))}
          </div>
        )}
      </main>

      <RateBookDialog
        open={rateEntry !== null}
        initialRating={rateEntry?.rating ?? null}
        canSave={rateEntry !== null}
        isSaving={rateEntry !== null && ratingEntryId === rateEntry.id}
        onClose={() => setRateEntryId(null)}
        onSave={async (rating) => {
          if (!rateEntry) {
            throw new Error("Unable to save rating");
          }
          await handleRatingChange(rateEntry.id, rating);
          setRateEntryId(null);
        }}
      />
    </div>
  );
}
