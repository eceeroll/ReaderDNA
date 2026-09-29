import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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

function SectionChevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      size={20}
      strokeWidth={1.75}
      aria-hidden
      className={clsx(
        "size-5 shrink-0 text-ink-muted motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-soft",
        open && "rotate-180",
      )}
    />
  );
}

function LibrarySection({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = useId();

  return (
    <section>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="-mx-3 flex w-[calc(100%+1.5rem)] items-center justify-between gap-3 rounded-md px-3 py-1 text-left hover:bg-surface focus-visible:shadow-[0_0_0_3px_var(--color-warm-tint)] focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-250 motion-safe:ease-standard"
        >
          <span className="min-w-0 font-sans text-2xl leading-tight font-semibold text-ink">
            {title} ({count})
          </span>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink">
            <SectionChevron open={open} />
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        className={clsx(
          "grid motion-safe:transition-[grid-template-rows] motion-safe:duration-250 motion-safe:ease-soft",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={clsx("min-h-0 overflow-hidden", !open && "pointer-events-none")}
          inert={!open}
        >
          <div className="pt-8 pb-3">{children}</div>
        </div>
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
  const [openSections, setOpenSections] = useState<Record<ReadStatus, boolean>>({
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
    const previousRating = current.rating;
    const nextRating = status === "READ" ? current.rating : null;
    updatingEntryIdRef.current = id;
    setUpdatingEntryId(id);
    setOpenSections((sections) => ({ ...sections, [status]: true }));
    setItems((list) =>
      list?.map((item) =>
        item.id === id ? { ...item, status, rating: nextRating } : item,
      ) ?? null,
    );
    setActionError(null);

    try {
      await updateLibraryEntry(id, { status });
    } catch (error) {
      setItems((list) =>
        list?.map((item) =>
          item.id === id
            ? { ...item, status: previousStatus, rating: previousRating }
            : item,
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
    if (!current || current.status !== "READ") {
      throw new Error("Unable to save rating");
    }

    const previousRating = current.rating;
    ratingEntryIdRef.current = id;
    setRatingEntryId(id);
    setItems((list) =>
      list?.map((item) => (item.id === id ? { ...item, rating } : item)) ??
      null,
    );
    setActionError(null);

    try {
      await updateLibraryEntry(id, { rating });
    } catch (error) {
      setItems((list) =>
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
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-16 md:pt-16">
        <h1 className="font-display text-[32px] leading-[1.2] font-semibold text-ink">
          Your library
        </h1>
        <p className="mt-2 max-w-xl font-sans text-[15px] leading-[1.6] text-ink-muted">
          Grouped by what you want to read, what you are reading, and what you
          have finished.
        </p>

        {isLoading && (
          <p className="mt-10 font-sans text-[15px] text-ink-muted" aria-busy="true">
            Loading your library...
          </p>
        )}

        {loadError !== null && (
          <div className="mt-10">
            <FieldError message={loadError} align="start" />
          </div>
        )}

        {items !== null && items.length === 0 && (
          <div className="mt-10 max-w-xl">
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
          <div className="mt-10 flex flex-col gap-10">
            {sections.map((section) => (
              <LibrarySection
                key={section.status}
                title={section.title}
                count={section.items.length}
                open={openSections[section.status]}
                onToggle={() =>
                  setOpenSections((current) => ({
                    ...current,
                    [section.status]: !current[section.status],
                  }))
                }
              >
                <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                  {section.items.map((entry) => (
                    <li key={entry.id} className="min-w-0">
                      <LibraryBookCard
                        entry={entry}
                        isUpdating={updatingEntryId === entry.id}
                        onStatusChange={handleStatusChange}
                        onRequestRate={setRateEntryId}
                        actionError={
                          actionError?.id === entry.id ? actionError.message : null
                        }
                      />
                    </li>
                  ))}
                </ul>
              </LibrarySection>
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
