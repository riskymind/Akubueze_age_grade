-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetToken" TEXT UNIQUE;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" TIMESTAMPTZ;
