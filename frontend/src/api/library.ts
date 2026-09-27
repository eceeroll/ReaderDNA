import { api } from "../lib/api-client";

export type ReadStatus = "READ" | "WANT_TO_READ";

// Used to create and update library entries.
export type UserBook = {
  id: number;
  userId: number;
  bookId: number;
  status: ReadStatus;
  rating: number | null;
  addedAt: string;
};

// Represents a book from the Google Books API. Used to display book details.
export type LibraryBook = {
  googleBooksId: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  averageRating: number | null;
  genres: string[];
};

// Represents a book in the user's library. Used to display library entries.
export type UserLibraryEntry = {
  id: number;
  status: ReadStatus;
  rating: number | null;
  book: LibraryBook;
};

// Gets the user's library entries.
export async function getLibrary(): Promise<{ items: UserLibraryEntry[] }> {
  const response = await api.get<{ items: UserLibraryEntry[] }>("/library");
  return response.data;
}

// Adds a book to the user's library.
export async function addBookToLibrary(data: {
  googleBooksId: string;
  status: ReadStatus;
}): Promise<UserBook> {
  const response = await api.post<UserBook>("/library", data);
  return response.data;
}

// Updates a library entry. (status and rating are optional)
export async function updateLibraryEntry(
  id: number,
  data: {
    status?: ReadStatus;
    rating?: number;
  },
): Promise<UserBook> {
  const response = await api.patch<UserBook>(`/library/${id}`, data);
  return response.data;
}
