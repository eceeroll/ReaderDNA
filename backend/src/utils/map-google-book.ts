import type { GoogleBookSearchResult } from "../types/google-books-types.js";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function parsePublishedYear(publishedDate: unknown): number | null {
  if (typeof publishedDate !== "string") {
    return null;
  }

  const match = publishedDate.match(/^(\d{4})/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function toHttpsUrl(url: unknown): string | null {
  if (typeof url !== "string" || url.length === 0) {
    return null;
  }

  return url.replace(/^http:\/\//i, "https://");
}

/** Extract `items` from a Google Books volumes list response. */
export function getGoogleBooksVolumeItems(data: unknown): unknown[] {
  const record = asRecord(data);
  if (!record || !Array.isArray(record.items)) {
    return [];
  }

  return record.items;
}

export function mapGoogleBookToSearchResult(
  item: unknown,
): GoogleBookSearchResult {
  const record = asRecord(item);
  const volumeInfo = asRecord(record?.volumeInfo) ?? {};
  const imageLinks = asRecord(volumeInfo.imageLinks);
  const authors = readStringArray(volumeInfo.authors);

  return {
    googleBooksId: readString(record?.id) ?? "",
    title: readString(volumeInfo.title) ?? "",
    subtitle: readString(volumeInfo.subtitle),
    author: authors[0] ?? "Unknown Author",
    genres: readStringArray(volumeInfo.categories),
    pageCount: readFiniteNumber(volumeInfo.pageCount),
    publishedYear: parsePublishedYear(volumeInfo.publishedDate),
    averageRating: readFiniteNumber(volumeInfo.averageRating),
    language: readString(volumeInfo.language),
    coverImageUrl: toHttpsUrl(imageLinks?.thumbnail),
  };
}

/** Shared guard: skip/reject mapped volumes missing identity fields. */
export function hasRequiredGoogleBookFields(
  book: GoogleBookSearchResult,
): boolean {
  return book.googleBooksId.length > 0 && book.title.length > 0;
}
