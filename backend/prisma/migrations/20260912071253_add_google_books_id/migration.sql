/*
  Warnings:

  - A unique constraint covering the columns `[googleBooksIs]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "googleBooksIs" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleBooksIs_key" ON "Book"("googleBooksIs");
