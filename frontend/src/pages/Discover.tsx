import { useEffect, useRef, useState, type FormEvent } from "react";
import { getDiscoverShelf, searchBooks, type BookSearchResult } from "../api/books";
import { addBookToLibrary, getLibraryBookIds } from "../api/library";
import { BookCard } from "../components/book/BookCard";
import { Button } from "../components/ui/Button";
import { FieldError } from "../components/ui/FieldError";
import { Input } from "../components/ui/Input";
import { ApiError } from "../lib/api-client";

const DISCOVERY_SHELVES = [
  { id: "science-fiction", title: "Science Fiction" },
  { id: "fantasy", title: "Fantasy" },
  { id: "mystery-thriller", title: "Mystery & Thriller" },
  { id: "horror", title: "Horror" },
  { id: "romance", title: "Romance" },
  { id: "historical-fiction", title: "Historical Fiction" },
] as const;

type ShelfState = {
  id: string;
  title: string;
  items: BookSearchResult[];
  isLoading: boolean;
  error: string | null;
};

function createInitialShelves(): ShelfState[] {
  return DISCOVERY_SHELVES.map((shelf) => ({
    id: shelf.id,
    title: shelf.title,
    items: [],
    isLoading: true,
    error: null,
  }));
}

function SearchIcon() {
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
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function ShelfRow({
  shelf,
  addingBookId,
  addedBookIds,
  addError,
  onAdd,
}: {
  shelf: ShelfState;
  addingBookId: string | null;
  addedBookIds: Set<string>;
  addError: { bookId: string; message: string } | null;
  onAdd: (googleBooksId: string) => void;
}) {
  return (
    <section aria-labelledby={`shelf-${shelf.id}`} aria-busy={shelf.isLoading}>
      <h2
        id={`shelf-${shelf.id}`}
        className="font-display text-2xl leading-[1.25] font-semibold text-ink"
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
              className="w-40 shrink-0 sm:w-44 lg:w-40"
              isAdding={addingBookId === book.googleBooksId}
              isAdded={addedBookIds.has(book.googleBooksId)}
              addError={
                addError?.bookId === book.googleBooksId ? addError.message : null
              }
              onAdd={onAdd}
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
  const [addingBookId, setAddingBookId] = useState<string | null>(null);
  const addingBookIdRef = useRef<string | null>(null);
  const [addedBookIds, setAddedBookIds] = useState<Set<string>>(() => new Set());
  const [addError, setAddError] = useState<{
    bookId: string;
    message: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [shelves, setShelves] = useState<ShelfState[]>(createInitialShelves);

  useEffect(() => {
    let active = true;

    getLibraryBookIds()
      .then((ids) => {
        if (!active) {
          return;
        }

        setAddedBookIds((current) => {
          const next = new Set(current);
          for (const id of ids) {
            next.add(id);
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

    for (const shelf of DISCOVERY_SHELVES) {
      getDiscoverShelf(shelf.id)
        .then((result) => {
          if (!active) {
            return;
          }

          setShelves((current) =>
            current.map((entry) =>
              entry.id === shelf.id
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
              entry.id === shelf.id
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

  async function handleAdd(googleBooksId: string) {
    if (addingBookIdRef.current !== null || addedBookIds.has(googleBooksId)) {
      return;
    }

    addingBookIdRef.current = googleBooksId;
    setAddingBookId(googleBooksId);
    setAddError(null);

    try {
      await addBookToLibrary({
        googleBooksId,
        status: "WANT_TO_READ",
      });
      setAddedBookIds((current) => new Set(current).add(googleBooksId));
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setAddedBookIds((current) => new Set(current).add(googleBooksId));
        return;
      }

      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      setAddError({ bookId: googleBooksId, message });
    } finally {
      addingBookIdRef.current = null;
      setAddingBookId(null);
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
            <p className="mt-2 font-accent text-[16px] leading-[1.4] text-ink-muted">
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
                  leadingIcon={<SearchIcon />}
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
            <h2 className="font-display text-2xl leading-[1.25] font-semibold text-ink">
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
              <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {searchResults.map((book, index) => (
                  <li key={`${book.googleBooksId}-${index}`} className="min-w-0">
                    <BookCard
                      book={book}
                      className="h-full"
                      isAdding={addingBookId === book.googleBooksId}
                      isAdded={addedBookIds.has(book.googleBooksId)}
                      addError={
                        addError?.bookId === book.googleBooksId
                          ? addError.message
                          : null
                      }
                      onAdd={handleAdd}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div>
          <h2 className="font-display text-2xl leading-[1.25] font-semibold text-ink">
            Browse the shelves
          </h2>
          <div className="mt-10 flex flex-col gap-16 md:gap-24">
            {shelves.map((shelf) => (
              <ShelfRow
                key={shelf.id}
                shelf={shelf}
                addingBookId={addingBookId}
                addedBookIds={addedBookIds}
                addError={addError}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
