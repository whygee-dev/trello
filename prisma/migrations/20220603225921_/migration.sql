/*
  Warnings:

  - You are about to drop the column `invitedUserId` on the `Invitation` table. All the data in the column will be lost.
  - Added the required column `validFor` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_invitedUserId_fkey";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "invitedUserId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validFor" TEXT NOT NULL;
