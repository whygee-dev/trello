-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "xIndex" DROP DEFAULT;
DROP SEQUENCE "Card_xIndex_seq";

-- AlterTable
ALTER TABLE "Column" ALTER COLUMN "yIndex" DROP DEFAULT;
DROP SEQUENCE "Column_yIndex_seq";
