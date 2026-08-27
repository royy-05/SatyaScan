-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "DocType" ADD VALUE 'PAN';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "deviceHashId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "registrationReason" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "Verification" ADD COLUMN     "amlHit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "courtHistoryHit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "efirHit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "networkFlags" JSONB;

-- CreateTable
CREATE TABLE "DeviceFingerprint" (
    "id" TEXT NOT NULL,
    "deviceHash" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VelocityEvent" (
    "id" TEXT NOT NULL,
    "deviceHash" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VelocityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalWatchlist" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityValue" TEXT NOT NULL,
    "threatLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceFingerprint_deviceHash_key" ON "DeviceFingerprint"("deviceHash");

-- CreateIndex
CREATE INDEX "VelocityEvent_deviceHash_timestamp_idx" ON "VelocityEvent"("deviceHash", "timestamp");

-- CreateIndex
CREATE INDEX "GlobalWatchlist_entityValue_idx" ON "GlobalWatchlist"("entityValue");

-- CreateIndex
CREATE INDEX "Document_deviceHashId_idx" ON "Document"("deviceHashId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_deviceHashId_fkey" FOREIGN KEY ("deviceHashId") REFERENCES "DeviceFingerprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VelocityEvent" ADD CONSTRAINT "VelocityEvent_deviceHash_fkey" FOREIGN KEY ("deviceHash") REFERENCES "DeviceFingerprint"("deviceHash") ON DELETE RESTRICT ON UPDATE CASCADE;
