import { api } from "../lib/api-client";

export type BookSearchResult = {
  googleBooksId: string;
  title: string;
  subtitle: string | null;
  author: string;
  genres: string[];
  pageCount: number | null;
  publishedYear: number | null;
  averageRating: number | null;
  language: string | null;
  coverImageUrl: string | null;
};

type BookSearchResponse = {
  items: BookSearchResult[];
};

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const response = await api.get<BookSearchResponse>("/books/search", {
    params: { q: query },
  });
  return response.data.items;
}

export type DiscoverShelfResponse = {
  id: string;
  title: string;
  items: BookSearchResult[];
};

export async function getDiscoverShelf(
  shelfId: string,
): Promise<DiscoverShelfResponse> {
  const response = await api.get<DiscoverShelfResponse>("/books/discover", {
    params: { shelf: shelfId },
  });
  return response.data;
}
