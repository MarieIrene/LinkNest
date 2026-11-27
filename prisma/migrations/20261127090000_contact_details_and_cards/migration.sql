-- AlterTable
ALTER TABLE "User" ADD COLUMN "jobTitle" TEXT,
ADD COLUMN "company" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "whatsapp" TEXT,
ADD COLUMN "publicEmail" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "contactSaves" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'business-card',
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT,
    "taps" INTEGER NOT NULL DEFAULT 0,
    "lastTapAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_code_key" ON "Card"("code");

-- CreateIndex
CREATE INDEX "Card_userId_idx" ON "Card"("userId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
