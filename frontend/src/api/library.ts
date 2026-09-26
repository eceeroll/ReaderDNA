import { api } from "../lib/api-client";

export type ReadStatus = "READ" | "WANT_TO_READ";

export type UserBook = {
  id: number;
  userId: number;
  bookId: number;
  status: ReadStatus;
  rating: number | null;
  addedAt: string;
};

export async function getLibraryBookIds(): Promise<string[]> {
  const response = await api.get<{ items: string[] }>("/library");
  return response.data.items;
}

export async function addBookToLibrary(data: {
  googleBooksId: string;
  status: ReadStatus;
}): Promise<UserBook> {
  const response = await api.post<UserBook>("/library", data);
  return response.data;
}
