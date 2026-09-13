/*
  Warnings:

  - You are about to drop the column `goodreadsRating` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "goodreadsRating",
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ALTER COLUMN "pageCount" DROP NOT NULL,
ALTER COLUMN "publishedYear" DROP NOT NULL;
