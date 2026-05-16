-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentType" ADD VALUE 'MEETING_HOST_FEE';
ALTER TYPE "PaymentType" ADD VALUE 'MEETING_ATTENDANCE_FEE';

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "hostId" TEXT;

-- CreateIndex
CREATE INDEX "meetings_hostId_idx" ON "meetings"("hostId");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
