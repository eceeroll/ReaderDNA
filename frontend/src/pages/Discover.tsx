import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  getDiscoverShelf,
  searchBooks,
  type BookSearchResult,
} from "../api/books";
import {
  addBookToLibrary,
  getLibrary,
  updateLibraryEntry,
  type ReadStatus,
} from "../api/library";
import {
  BookCard,
  type BookCardLibraryEntry,
} from "../components/book/BookCard";
import { Button } from "../components/ui/Button";
import { FieldError } from "../components/ui/FieldError";
import { Input } from "../components/ui/Input";
import { Search } from "lucide-react";
import { ApiError } from "../lib/api-client";

const DISCOVERY_SHELF_IDS = [
  "science-fiction",
  "fantasy",
  "mystery-thriller",
  "horror",
  "romance",
  "historical-fiction",
] as const;

type ShelfState = {
  id: string;
  title: string;
  items: BookSearchResult[];
  isLoading: boolean;
  error: string | null;
};

function createInitialShelves(): ShelfState[] {
  return DISCOVERY_SHELF_IDS.map((id) => ({
    id,
    title: "",
    items: [],
    isLoading: true,
    error: null,
  }));
}

function ShelfRow({
  shelf,
  updatingBookId,
  ratingBookId,
  libraryEntries,
  addError,
  onStatusChange,
  onRate,
}: {
  shelf: ShelfState;
  updatingBookId: string | null;
  ratingBookId: string | null;
  libraryEntries: Map<string, BookCardLibraryEntry>;
  addError: { bookId: string; message: string } | null;
  onStatusChange: (googleBooksId: string, status: ReadStatus) => void;
  onRate: (libraryEntryId: number, rating: number) => void;
}) {
  return (
    <section aria-labelledby={`shelf-${shelf.id}`} aria-busy={shelf.isLoading}>
      <h2
        id={`shelf-${shelf.id}`}
        className="font-sans text-2xl leading-tight font-semibold text-ink"
      >
        {shelf.title}
      </h2>

      {shelf.isLoading && (
        <p className="mt-4 font-sans text-[15px] text-ink-muted">
          Pulling books from this shelf...
        </p>
      )}

      {shelf.error !== null && (
        <div className="mt-4">
          <FieldError message={shelf.error} />
        </div>
      )}

      {!shelf.isLoading && shelf.error === null && shelf.items.length === 0 && (
        <p className="mt-4 font-sans text-[15px] leading-[1.6] text-ink-muted">
          Nothing on this shelf right now.
        </p>
      )}

      {shelf.items.length > 0 && (
        <div className="mt-6 flex gap-6 overflow-x-auto py-3">
          {shelf.items.map((book, index) => (
            <BookCard
              key={`${book.googleBooksId}-${index}`}
              book={book}
              compact
              className="w-48 shrink-0"
              isUpdating={updatingBookId === book.googleBooksId}
              isRating={ratingBookId === book.googleBooksId}
              libraryEntry={libraryEntries.get(book.googleBooksId) ?? null}
              addError={
                addError?.bookId === book.googleBooksId
                  ? addError.message
                  : null
              }
              onStatusChange={onStatusChange}
              onRate={onRate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [updatingBookId, setUpdatingBookId] = useState<string | null>(null);
  const updatingBookIdRef = useRef<string | null>(null);
  const [ratingBookId, setRatingBookId] = useState<string | null>(null);
  const ratingBookIdRef = useRef<string | null>(null);
  const [libraryEntries, setLibraryEntries] = useState<
    Map<string, BookCardLibraryEntry>
  >(() => new Map());
  const [addError, setAddError] = useState<{
    bookId: string;
    message: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [shelves, setShelves] = useState<ShelfState[]>(createInitialShelves);

  useEffect(() => {
    let active = true;

    getLibrary()
      .then((library) => {
        if (!active) {
          return;
        }

        setLibraryEntries((current) => {
          const next = new Map(current);
          for (const item of library.items) {
            next.set(item.book.googleBooksId, {
              id: item.id,
              status: item.status,
              rating: item.rating,
            });
          }
          return next;
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    for (const id of DISCOVERY_SHELF_IDS) {
      getDiscoverShelf(id)
        .then((result) => {
          if (!active) {
            return;
          }

          setShelves((current) =>
            current.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    title: result.title,
                    items: result.items,
                    isLoading: false,
                    error: null,
                  }
                : entry,
            ),
          );
        })
        .catch((error: unknown) => {
          if (!active) {
            return;
          }

          const message =
            error instanceof ApiError
              ? error.message
              : "Something went wrong. Please try again.";

          setShelves((current) =>
            current.map((entry) =>
              entry.id === id
                ? { ...entry, isLoading: false, error: message }
                : entry,
            ),
          );
        });
    }

    return () => {
      active = false;
    };
  }, []);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    setSearchError(null);

    if (!query) {
      setSearchError("Enter a title or author to search.");
      return;
    }

    setIsSearching(true);

    try {
      const items = await searchBooks(query);
      setSearchResults(items);
      setHasSearched(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setSearchError(error.message);
      } else {
        setSearchError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  }

  function insertLibraryEntry(
    googleBooksId: string,
    entry: BookCardLibraryEntry,
  ) {
    setLibraryEntries((current) => {
      const next = new Map(current);
      next.set(googleBooksId, entry);
      return next;
    });
  }

  async function handleStatusChange(
    googleBooksId: string,
    status: ReadStatus,
  ) {
    if (updatingBookIdRef.current !== null) {
      return;
    }

    const existing = libraryEntries.get(googleBooksId);
    updatingBookIdRef.current = googleBooksId;
    setUpdatingBookId(googleBooksId);
    setAddError(null);

    try {
      if (!existing) {
        try {
          const created = await addBookToLibrary({
            googleBooksId,
            status,
          });
          insertLibraryEntry(googleBooksId, {
            id: created.id,
            status: created.status,
            rating: created.rating,
          });
        } catch (error) {
          if (error instanceof ApiError && error.status === 409) {
            try {
              const library = await getLibrary();
              const recovered = library.items.find(
                (item) => item.book.googleBooksId === googleBooksId,
              );
              if (recovered) {
                insertLibraryEntry(googleBooksId, {
                  id: recovered.id,
                  status: recovered.status,
                  rating: recovered.rating,
                });
                return;
              }
            } catch {
              // Fall through to the existing error message below.
            }
          }

          const message =
            error instanceof ApiError
              ? error.message
              : "Something went wrong. Please try again.";
          setAddError({ bookId: googleBooksId, message });
        }
        return;
      }

      const previousStatus = existing.status;
      const previousRating = existing.rating;
      const nextRating = status === "READ" ? existing.rating : null;
      setLibraryEntries((current) => {
        const next = new Map(current);
        const currentEntry = next.get(googleBooksId);
        if (!currentEntry) {
          return current;
        }
        next.set(googleBooksId, {
          ...currentEntry,
          status,
          rating: nextRating,
        });
        return next;
      });

      try {
        await updateLibraryEntry(existing.id, { status });
      } catch (error) {
        setLibraryEntries((current) => {
          const next = new Map(current);
          const currentEntry = next.get(googleBooksId);
          if (!currentEntry || currentEntry.id !== existing.id) {
            return current;
          }
          next.set(googleBooksId, {
            ...currentEntry,
            status: previousStatus,
            rating: previousRating,
          });
          return next;
        });

        const message =
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.";
        setAddError({ bookId: googleBooksId, message });
      }
    } finally {
      updatingBookIdRef.current = null;
      setUpdatingBookId(null);
    }
  }

  async function handleRate(libraryEntryId: number, rating: number) {
    if (ratingBookIdRef.current !== null) {
      throw new Error("Unable to save rating");
    }

    const match = [...libraryEntries.entries()].find(
      ([, entry]) => entry.id === libraryEntryId,
    );
    if (!match) {
      throw new Error("Unable to save rating");
    }

    const [googleBooksId, entry] = match;
    if (entry.status !== "READ") {
      throw new Error("Unable to save rating");
    }

    const previousRating = entry.rating;

    ratingBookIdRef.current = googleBooksId;
    setRatingBookId(googleBooksId);
    setLibraryEntries((current) => {
      const next = new Map(current);
      const currentEntry = next.get(googleBooksId);
      if (!currentEntry) {
        return current;
      }
      next.set(googleBooksId, { ...currentEntry, rating });
      return next;
    });
    setAddError(null);

    try {
      await updateLibraryEntry(libraryEntryId, { rating });
    } catch (error) {
      setLibraryEntries((current) => {
        const next = new Map(current);
        const currentEntry = next.get(googleBooksId);
        if (!currentEntry || currentEntry.id !== libraryEntryId) {
          return current;
        }
        next.set(googleBooksId, { ...currentEntry, rating: previousRating });
        return next;
      });

      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      setAddError({ bookId: googleBooksId, message });
      throw error;
    } finally {
      ratingBookIdRef.current = null;
      setRatingBookId(null);
    }
  }

  const showEmptyResults =
    hasSearched &&
    !isSearching &&
    searchError === null &&
    searchResults.length === 0;

  return (
    <div className="min-h-screen bg-page">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="max-w-2xl">
            <h1 className="font-display text-[32px] leading-[1.2] font-semibold text-ink">
              Find a book for your shelf
            </h1>
            <p className="mt-2 font-sans text-[16px] leading-[1.4] text-ink-muted">
              A quiet corner to wander the shelves.
            </p>
          </div>

          <form onSubmit={handleSearch} className="mt-8 max-w-2xl" noValidate>
            <label
              htmlFor="book-search"
              className="mb-2 block font-sans text-[15px] text-ink"
            >
              Title or author
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Input
                  id="book-search"
                  type="search"
                  value={searchQuery}
                  placeholder="The Night Circus, or Kazuo Ishiguro"
                  leadingIcon={
                    <Search size={16} strokeWidth={1.75} aria-hidden />
                  }
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchError(null);
                  }}
                  invalid={searchError !== null && searchQuery.trim() === ""}
                />
              </div>
              <Button
                variant="primary"
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            {searchError !== null && (
              <div className="mt-3">
                <FieldError message={searchError} />
              </div>
            )}
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-16 md:pt-16">
        {(isSearching || hasSearched) && (
          <section className="mb-16 md:mb-24" aria-live="polite">
            <h2 className="font-sans text-2xl leading-tight font-semibold text-ink">
              From your search
            </h2>

            {isSearching && (
              <p className="mt-4 font-sans text-[15px] text-ink-muted">
                Looking for books...
              </p>
            )}

            {showEmptyResults && (
              <p className="mt-4 max-w-xl font-sans text-[15px] leading-[1.6] text-ink-muted">
                Nothing turned up for that search. Try another title or author.
              </p>
            )}

            {searchResults.length > 0 && (
              <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {searchResults.map((book, index) => (
                  <li
                    key={`${book.googleBooksId}-${index}`}
                    className="min-w-0"
                  >
                    <BookCard
                      book={book}
                      className="h-full p-4!"
                      isUpdating={updatingBookId === book.googleBooksId}
                      isRating={ratingBookId === book.googleBooksId}
                      libraryEntry={
                        libraryEntries.get(book.googleBooksId) ?? null
                      }
                      addError={
                        addError?.bookId === book.googleBooksId
                          ? addError.message
                          : null
                      }
                      onStatusChange={handleStatusChange}
                      onRate={handleRate}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div>
          <h2 className="font-sans text-2xl leading-tight font-semibold text-ink">
            Browse the shelves
          </h2>
          <div className="mt-10 flex flex-col gap-16 md:gap-24">
            {shelves.map((shelf) => (
              <ShelfRow
                key={shelf.id}
                shelf={shelf}
                updatingBookId={updatingBookId}
                ratingBookId={ratingBookId}
                libraryEntries={libraryEntries}
                addError={addError}
                onStatusChange={handleStatusChange}
                onRate={handleRate}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
