-- AlterTable
ALTER TABLE "User" ADD COLUMN "cardTaps" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Link" ADD COLUMN "platform" TEXT NOT NULL DEFAULT 'website';

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
