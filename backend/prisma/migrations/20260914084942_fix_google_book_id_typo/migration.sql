/*
  Warnings:

  - You are about to drop the column `googleBooksIs` on the `Book` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleBooksId]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Book_googleBooksIs_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "googleBooksIs",
ADD COLUMN     "googleBooksId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Book_googleBooksId_key" ON "Book"("googleBooksId");
