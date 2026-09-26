import { mapGoogleBookToSearchResult } from "./map-google-book.js";
import type { GoogleBookSearchResult } from "../types/google-books-types.js";

const CACHE_TTL_MS = 60 * 60 * 1000;
const SHELF_LIMIT = 10;
const GOOGLE_MAX_RESULTS = 40;
const GOOGLE_BOOKS_TIMEOUT_MS = 10_000;

export const DISCOVERY_SHELF_IDS = [
  "science-fiction",
  "fantasy",
  "mystery-thriller",
  "horror",
  "romance",
  "historical-fiction",
] as const;

export type DiscoveryShelfId = (typeof DISCOVERY_SHELF_IDS)[number];

type DiscoveryShelfDefinition = {
  title: string;
  query: string | readonly [string, string];
};

export const DISCOVERY_SHELVES = {
  "science-fiction": {
    title: "Science Fiction",
    query: 'subject:"science fiction"',
  },
  fantasy: {
    title: "Fantasy",
    query: "subject:fantasy",
  },
  "mystery-thriller": {
    title: "Mystery & Thriller",
    query: ["subject:mystery", "subject:thriller"],
  },
  horror: {
    title: "Horror",
    query: "subject:horror",
  },
  romance: {
    title: "Romance",
    query: "subject:romance",
  },
  "historical-fiction": {
    title: "Historical Fiction",
    query: 'subject:"historical fiction"',
  },
} as const satisfies Record<DiscoveryShelfId, DiscoveryShelfDefinition>;

export type DiscoveryShelf = {
  id: DiscoveryShelfId;
  title: string;
  query: string | readonly [string, string];
};

export class DiscoveryShelfLoadError extends Error {
  readonly statusCode: 500 | 502;

  constructor(statusCode: 500 | 502, message: string) {
    super(message);
    this.name = "DiscoveryShelfLoadError";
    this.statusCode = statusCode;
  }
}

type CacheEntry = {
  expiresAt: number;
  items: GoogleBookSearchResult[];
};

const shelfCache = new Map<DiscoveryShelfId, CacheEntry>();
const shelfRequests = new Map<
  DiscoveryShelfId,
  Promise<GoogleBookSearchResult[]>
>();

export function findDiscoveryShelf(id: DiscoveryShelfId): DiscoveryShelf {
  const shelf = DISCOVERY_SHELVES[id];

  return {
    id,
    title: shelf.title,
    query: shelf.query,
  };
}

const EXCLUDED_CATEGORY_TERMS = [
  "criticism",
  "encyclopedias",
  "handbooks",
  "study aids",
  "bibliography",
  "reference",
] as const;

function isJuvenileBook(genres: string[]): boolean {
  return genres.some(
    (genre) =>
      typeof genre === "string" && genre.toLowerCase().includes("juvenile"),
  );
}

function isExcludedCategory(genres: string[]): boolean {
  return genres.some(
    (genre) =>
      typeof genre === "string" &&
      EXCLUDED_CATEGORY_TERMS.some((term) =>
        genre.toLowerCase().includes(term),
      ),
  );
}

function hasCover(book: GoogleBookSearchResult): boolean {
  return book.coverImageUrl !== null && book.coverImageUrl.length > 0;
}

function mapShelfItems(items: unknown[]): GoogleBookSearchResult[] {
  const seen = new Set<string>();
  const uniqueBooks: GoogleBookSearchResult[] = [];

  for (const item of items) {
    const book = mapGoogleBookToSearchResult(item);

    if (!book.googleBooksId || seen.has(book.googleBooksId)) {
      continue;
    }

    seen.add(book.googleBooksId);
    uniqueBooks.push(book);
  }

  const withCovers: GoogleBookSearchResult[] = [];
  const withoutCovers: GoogleBookSearchResult[] = [];

  for (const book of uniqueBooks) {
    if (
      !book.title ||
      isJuvenileBook(book.genres) ||
      isExcludedCategory(book.genres)
    ) {
      continue;
    }

    if (hasCover(book)) {
      withCovers.push(book);
    } else {
      withoutCovers.push(book);
    }
  }

  return [...withCovers, ...withoutCovers].slice(0, SHELF_LIMIT);
}

function mergeShelfGroups(groups: unknown[][]): GoogleBookSearchResult[] {
  if (groups.length < 2) {
    return mapShelfItems(groups[0] ?? []);
  }

  const selected = groups.map((group) => mapShelfItems(group));
  const seen = new Set<string>();
  const merged: GoogleBookSearchResult[] = [];
  const longest = Math.max(...selected.map((books) => books.length));

  for (let index = 0; index < longest && merged.length < SHELF_LIMIT; index++) {
    for (const books of selected) {
      const book = books[index];

      if (!book || seen.has(book.googleBooksId)) {
        continue;
      }

      seen.add(book.googleBooksId);
      merged.push(book);

      if (merged.length === SHELF_LIMIT) {
        break;
      }
    }
  }

  return merged;
}

async function fetchVolumeItems(
  apiKey: string,
  query: string,
  maxResults: number,
): Promise<unknown[]> {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", query);
  url.searchParams.set("langRestrict", "en");
  url.searchParams.set("printType", "books");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(GOOGLE_BOOKS_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Google Books API responded with status ${response.status}`,
    );
  }

  const data = (await response.json()) as { items?: unknown[] };
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchShelfItems(
  shelf: DiscoveryShelf,
): Promise<GoogleBookSearchResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    console.error(new Error("GOOGLE_BOOKS_API_KEY is not configured"));
    throw new DiscoveryShelfLoadError(500, "Internal Server Error");
  }

  const queries =
    typeof shelf.query === "string" ? [shelf.query] : [...shelf.query];
  const maxResults = queries.length > 1 ? 20 : GOOGLE_MAX_RESULTS;

  try {
    const itemGroups = await Promise.all(
      queries.map((query) => fetchVolumeItems(apiKey, query, maxResults)),
    );
    return mergeShelfGroups(itemGroups);
  } catch (error) {
    if (error instanceof DiscoveryShelfLoadError) {
      throw error;
    }

    console.error(error);
    throw new DiscoveryShelfLoadError(
      502,
      "Book search is temporarily unavailable. Please try again later.",
    );
  }
}

export function loadDiscoveryShelfItems(
  shelf: DiscoveryShelf,
): Promise<GoogleBookSearchResult[]> {
  const cached = shelfCache.get(shelf.id);

  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.items);
  }

  if (cached) {
    shelfCache.delete(shelf.id);
  }

  const pending = shelfRequests.get(shelf.id);

  if (pending) {
    return pending;
  }

  const request = fetchShelfItems(shelf)
    .then((items) => {
      shelfCache.set(shelf.id, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        items,
      });
      return items;
    })
    .finally(() => {
      shelfRequests.delete(shelf.id);
    });

  shelfRequests.set(shelf.id, request);
  return request;
}
