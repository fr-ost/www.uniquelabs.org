-- CreateEnum
CREATE TYPE "UnlockType" AS ENUM ('CLIFF', 'LINEAR', 'OTHER');

-- CreateTable
CREATE TABLE "IntelligenceSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT true,
    "assetLimit" INTEGER NOT NULL DEFAULT 100,
    "refreshSeconds" INTEGER NOT NULL DEFAULT 300,
    "watchlist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelligenceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Airdrop" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "tokenSymbol" TEXT,
    "cmcSlug" TEXT,
    "description" TEXT,
    "reward" TEXT,
    "requirements" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "officialUrl" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Airdrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenUnlock" (
    "id" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "cmcSlug" TEXT,
    "unlockAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(38,8),
    "percentOfSupply" DECIMAL(7,4),
    "allocation" TEXT,
    "unlockType" "UnlockType" NOT NULL DEFAULT 'CLIFF',
    "description" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Airdrop_status_endsAt_idx" ON "Airdrop"("status", "endsAt");

-- CreateIndex
CREATE INDEX "TokenUnlock_status_unlockAt_idx" ON "TokenUnlock"("status", "unlockAt");

-- Integrity rules the application must never be able to bypass -------------

ALTER TABLE "IntelligenceSettings" ADD CONSTRAINT "IntelligenceSettings_singleton" CHECK ("id" = 1);
ALTER TABLE "IntelligenceSettings"
  ADD CONSTRAINT "IntelligenceSettings_asset_limit_range" CHECK ("assetLimit" BETWEEN 10 AND 200);
ALTER TABLE "IntelligenceSettings"
  ADD CONSTRAINT "IntelligenceSettings_refresh_range" CHECK ("refreshSeconds" BETWEEN 60 AND 86400);

-- Curated events can only go public once the owner has verified them.
ALTER TABLE "Airdrop" ADD CONSTRAINT "Airdrop_published_requires_verification"
  CHECK ("status" <> 'PUBLISHED' OR "verifiedAt" IS NOT NULL);
ALTER TABLE "TokenUnlock" ADD CONSTRAINT "TokenUnlock_published_requires_verification"
  CHECK ("status" <> 'PUBLISHED' OR "verifiedAt" IS NOT NULL);
ALTER TABLE "TokenUnlock" ADD CONSTRAINT "TokenUnlock_percent_range"
  CHECK ("percentOfSupply" IS NULL OR "percentOfSupply" BETWEEN 0 AND 100);
ALTER TABLE "TokenUnlock" ADD CONSTRAINT "TokenUnlock_amount_positive"
  CHECK ("amount" IS NULL OR "amount" > 0);
