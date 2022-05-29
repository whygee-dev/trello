-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cardId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
