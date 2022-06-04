/*
  Warnings:

  - You are about to drop the column `xIndex` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `yIndex` on the `Column` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "xIndex",
ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Column" DROP COLUMN "yIndex",
ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;
