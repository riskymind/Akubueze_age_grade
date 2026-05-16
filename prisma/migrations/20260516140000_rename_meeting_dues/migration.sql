-- Alter PaymentType enum: remove MONTHLY_DUES, rename MEETING_ATTENDANCE_FEE to MEETING_DUES
-- PostgreSQL requires drop/recreate to remove enum values; safe here since migrate reset runs before seeding.

ALTER TABLE "payments" ALTER COLUMN "type" TYPE TEXT;

DROP TYPE "PaymentType";

CREATE TYPE "PaymentType" AS ENUM (
  'MEETING_HOST_FEE',
  'MEETING_DUES',
  'DEVELOPMENT_LEVY',
  'EVENT_CONTRIBUTION',
  'FINE',
  'DONATION'
);

ALTER TABLE "payments" ALTER COLUMN "type" TYPE "PaymentType" USING "type"::"PaymentType";
