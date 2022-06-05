-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "validFor" TEXT NOT NULL,
    "workSpaceId" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_id_key" ON "Invitation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_validFor_key" ON "Invitation"("validFor");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_workSpaceId_fkey" FOREIGN KEY ("workSpaceId") REFERENCES "WorkSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
