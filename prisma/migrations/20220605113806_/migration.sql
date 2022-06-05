/*
  Warnings:

  - Changed the type of `validFor` on the `Invitation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "validFor",
ADD COLUMN     "validFor" TIMESTAMP(3) NOT NULL;
