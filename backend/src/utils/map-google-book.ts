import type { GoogleBookSearchResult } from "../types/google-books-types.js";

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

export function mapGoogleBookToSearchResult(item: any): GoogleBookSearchResult {
  const volumeInfo = item?.volumeInfo ?? {};

  return {
    googleBooksId: item?.id ?? "",
    title: volumeInfo.title ?? "",
    subtitle: volumeInfo.subtitle ?? null,
    author: volumeInfo.authors?.[0] ?? "Unknown Author",
    genres: volumeInfo.categories ?? [],
    pageCount: volumeInfo.pageCount ?? null,
    publishedYear: parsePublishedYear(volumeInfo.publishedDate),
    averageRating: volumeInfo.averageRating ?? null,
    language: volumeInfo.language ?? null,
    coverImageUrl: toHttpsUrl(volumeInfo.imageLinks?.thumbnail),
  };
}
