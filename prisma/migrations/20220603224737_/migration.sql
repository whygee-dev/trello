/*
  Warnings:

  - You are about to drop the column `validFor` on the `Invitation` table. All the data in the column will be lost.
  - Added the required column `invitedUserId` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Invitation_validFor_key";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "validFor",
ADD COLUMN     "invitedUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
