/*
  Warnings:

  - You are about to drop the column `boardId` on the `Label` table. All the data in the column will be lost.
  - You are about to drop the `_CardToLabel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cardId` to the `Label` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_boardId_fkey";

-- DropForeignKey
ALTER TABLE "_CardToLabel" DROP CONSTRAINT "_CardToLabel_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardToLabel" DROP CONSTRAINT "_CardToLabel_B_fkey";

-- AlterTable
ALTER TABLE "Label" DROP COLUMN "boardId",
ADD COLUMN     "cardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cardId" TEXT;

-- DropTable
DROP TABLE "_CardToLabel";

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
