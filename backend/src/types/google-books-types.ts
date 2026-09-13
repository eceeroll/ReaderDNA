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
