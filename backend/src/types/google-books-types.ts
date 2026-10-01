/** Subset of a Google Books volume resource that ReaderDNA reads. */
export type GoogleBooksVolume = {
  id?: string;
  volumeInfo?: GoogleBooksVolumeInfo;
};

/** Subset of volumeInfo fields used by the mapper. */
export type GoogleBooksVolumeInfo = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  categories?: string[];
  pageCount?: number;
  publishedDate?: string;
  averageRating?: number;
  language?: string;
  imageLinks?: GoogleBooksImageLinks;
};

export type GoogleBooksImageLinks = {
  thumbnail?: string;
};

/** Normalized book DTO returned by search/discover and used when persisting. */
export interface GoogleBookSearchResult {
  googleBooksId: string;
  title: string;
  subtitle: string | null;
  author: string; // authors[0] ?? "Unknown Author"
  genres: string[]; // categories ?? []
  pageCount: number | null;
  publishedYear: number | null; // parse year from publishedDate
  averageRating: number | null;
  language: string | null;
  coverImageUrl: string | null; // http:// -> https:// convert
}
