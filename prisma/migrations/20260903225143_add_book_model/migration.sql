-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "genres" JSONB NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "publishedYear" INTEGER NOT NULL,
    "goodreadsRating" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
