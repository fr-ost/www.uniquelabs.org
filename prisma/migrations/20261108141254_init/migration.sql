-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DatePrecision" AS ENUM ('DAY', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "ReleaseStage" AS ENUM ('AVAILABLE', 'BETA', 'COMING_SOON', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('CHROME_EXTENSION', 'FIREFOX_ADDON', 'EDGE_ADDON', 'SAFARI_EXTENSION', 'WEB_APP', 'WEBSITE', 'IOS', 'ANDROID', 'MACOS', 'WINDOWS', 'LINUX', 'CLI', 'API', 'OTHER');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('UNSPECIFIED', 'FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE');

-- CreateEnum
CREATE TYPE "LinkKind" AS ENUM ('WEBSITE', 'STORE_LISTING', 'SOURCE_CODE', 'DOCUMENTATION', 'SUPPORT', 'PRIVACY_POLICY', 'CHANGELOG', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CollaborationCategory" AS ENUM ('BRAND_PARTNERSHIP', 'PRODUCT_INTEGRATION', 'CO_CREATION', 'SPONSORSHIP', 'CAMPAIGN', 'COMMUNITY', 'CONTRIBUTION', 'OTHER');

-- CreateEnum
CREATE TYPE "TeamMemberType" AS ENUM ('CURRENT', 'FORMER');

-- CreateEnum
CREATE TYPE "MilestoneKind" AS ENUM ('FOUNDING', 'PRODUCT', 'LAUNCH', 'COLLABORATION', 'MILESTONE', 'PLATFORM', 'ORGANIZATION', 'OTHER');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('X', 'LINKEDIN', 'GITHUB', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'THREADS', 'BLUESKY', 'MASTODON', 'DISCORD', 'TELEGRAM', 'MEDIUM', 'PRODUCT_HUNT', 'CHROME_WEB_STORE', 'OTHER');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('GENERAL', 'BUSINESS', 'PARTNERSHIP', 'PRESS', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED', 'SPAM');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateEnum
CREATE TYPE "MediaStorage" AS ENUM ('DATABASE', 'FILESYSTEM');

-- CreateEnum
CREATE TYPE "ImportKind" AS ENUM ('CLAUDE_EXPORT', 'X_ARCHIVE');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('AWAITING_FILES', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CandidateKind" AS ENUM ('PRODUCT', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED', 'MERGED');

-- CreateEnum
CREATE TYPE "ProductEvidenceStage" AS ENUM ('IDEA', 'PLANNING', 'IN_DEVELOPMENT', 'COMPLETED', 'BETA', 'PUBLISHED', 'CANCELLED', 'NEEDS_VERIFICATION');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NEEDS_VERIFICATION', 'EVIDENCE_FOUND', 'VERIFIED');

-- CreateEnum
CREATE TYPE "EvidenceSource" AS ENUM ('CLAUDE_CONVERSATION', 'CLAUDE_PROJECT', 'TWEET', 'URL', 'MANUAL');

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'Unique Labs',
    "legalName" TEXT,
    "tagline" TEXT,
    "shortDescription" TEXT NOT NULL,
    "heroEyebrow" TEXT,
    "heroHeadline" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'Explore Our Products',
    "secondaryCtaLabel" TEXT NOT NULL DEFAULT 'Discover Unique Labs',
    "introHeading" TEXT,
    "introBody" TEXT,
    "whoWeAre" TEXT,
    "whyWeExist" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "philosophyIntro" TEXT,
    "approach" TEXT,
    "longTermDirection" TEXT,
    "whatWeDoIntro" TEXT,
    "closingHeadline" TEXT,
    "closingBody" TEXT,
    "foundedDate" DATE,
    "foundedDatePrecision" "DatePrecision" NOT NULL DEFAULT 'YEAR',
    "foundedDateVerified" BOOLEAN NOT NULL DEFAULT false,
    "contactIntro" TEXT,
    "contactEmail" TEXT,
    "businessEmail" TEXT,
    "partnershipEmail" TEXT,
    "generalEmail" TEXT,
    "pressEmail" TEXT,
    "country" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "showAddress" BOOLEAN NOT NULL DEFAULT false,
    "logoId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "seoTitleDefault" TEXT NOT NULL DEFAULT 'Unique Labs',
    "seoTitleTemplate" TEXT NOT NULL DEFAULT '%s — Unique Labs',
    "seoDescription" TEXT NOT NULL,
    "seoKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "twitterHandle" TEXT,
    "allowIndexing" BOOLEAN NOT NULL DEFAULT true,
    "googleSiteVerification" TEXT,
    "bingSiteVerification" TEXT,
    "ogImageId" TEXT,
    "privacyPolicy" TEXT NOT NULL,
    "privacyUpdatedAt" DATE,
    "termsOfUse" TEXT NOT NULL,
    "termsUpdatedAt" DATE,
    "contactFormEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "audience" TEXT,
    "categoryId" TEXT,
    "platforms" "Platform"[],
    "stage" "ReleaseStage" NOT NULL DEFAULT 'COMING_SOON',
    "pricing" "PricingModel" NOT NULL DEFAULT 'UNSPECIFIED',
    "websiteUrl" TEXT,
    "primaryCtaUrl" TEXT,
    "primaryCtaLabel" TEXT,
    "releaseDate" DATE,
    "releaseDatePrecision" "DatePrecision" NOT NULL DEFAULT 'DAY',
    "releaseDateVerified" BOOLEAN NOT NULL DEFAULT false,
    "accentColor" TEXT,
    "logoId" TEXT,
    "coverId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFeature" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductLink" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "kind" "LinkKind" NOT NULL DEFAULT 'WEBSITE',
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "websiteUrl" TEXT,
    "xHandle" TEXT,
    "logoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "category" "CollaborationCategory" NOT NULL DEFAULT 'OTHER',
    "date" DATE,
    "datePrecision" "DatePrecision" NOT NULL DEFAULT 'DAY',
    "sourceUrl" TEXT,
    "sourceLabel" TEXT,
    "externalUrl" TEXT,
    "coverId" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaborationPartner" (
    "collaborationId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "role" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CollaborationPartner_pkey" PRIMARY KEY ("collaborationId","partnerId")
);

-- CreateTable
CREATE TABLE "TeamGroup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "shortBio" TEXT,
    "bio" TEXT,
    "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photoId" TEXT,
    "linkedinUrl" TEXT,
    "xUrl" TEXT,
    "githubUrl" TEXT,
    "websiteUrl" TEXT,
    "joinDate" DATE,
    "joinDatePrecision" "DatePrecision" NOT NULL DEFAULT 'MONTH',
    "joinDateVerified" BOOLEAN NOT NULL DEFAULT false,
    "memberType" "TeamMemberType" NOT NULL DEFAULT 'CURRENT',
    "isLeadership" BOOLEAN NOT NULL DEFAULT false,
    "hasProfilePage" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMilestone" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "datePrecision" "DatePrecision" NOT NULL DEFAULT 'DAY',
    "kind" "MilestoneKind" NOT NULL DEFAULT 'MILESTONE',
    "imageId" TEXT,
    "productId" TEXT,
    "collaborationId" TEXT,
    "sourceUrl" TEXT,
    "sourceLabel" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'sparkles',
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Principle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Principle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inquiryType" "InquiryType" NOT NULL DEFAULT 'GENERAL',
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT NOT NULL DEFAULT '',
    "sha256" TEXT NOT NULL,
    "storage" "MediaStorage" NOT NULL DEFAULT 'DATABASE',
    "storageKey" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaBlob" (
    "assetId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "MediaBlob_pkey" PRIMARY KEY ("assetId")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorLabel" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "kind" "ImportKind" NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'AWAITING_FILES',
    "label" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "files" JSONB NOT NULL DEFAULT '[]',
    "fingerprint" TEXT,
    "phase" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER,
    "stats" JSONB,
    "warnings" JSONB,
    "preview" JSONB,
    "errorMessage" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "heartbeatAt" TIMESTAMP(3),

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportCandidate" (
    "id" TEXT NOT NULL,
    "kind" "CandidateKind" NOT NULL,
    "status" "CandidateStatus" NOT NULL DEFAULT 'PENDING',
    "fingerprint" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "productStage" "ProductEvidenceStage",
    "collaborationCategory" "CollaborationCategory",
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "verification" "VerificationStatus" NOT NULL DEFAULT 'NEEDS_VERIFICATION',
    "data" JSONB NOT NULL DEFAULT '{}',
    "signals" JSONB NOT NULL DEFAULT '[]',
    "firstSeenAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "jobId" TEXT,
    "productId" TEXT,
    "collaborationId" TEXT,
    "mergedIntoId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceEvidence" (
    "id" TEXT NOT NULL,
    "sourceType" "EvidenceSource" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,
    "excerpt" TEXT,
    "sourceTimestamp" TIMESTAMP(3),
    "author" TEXT,
    "details" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "candidateId" TEXT,
    "productId" TEXT,
    "collaborationId" TEXT,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollaborationToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollaborationToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CapabilityToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CapabilityToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_sortOrder_idx" ON "Product"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "ProductFeature_productId_sortOrder_idx" ON "ProductFeature"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductLink_productId_sortOrder_idx" ON "ProductLink"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_slug_key" ON "Collaboration"("slug");

-- CreateIndex
CREATE INDEX "Collaboration_status_date_idx" ON "Collaboration"("status", "date");

-- CreateIndex
CREATE INDEX "CollaborationPartner_partnerId_idx" ON "CollaborationPartner"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamGroup_slug_key" ON "TeamGroup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");

-- CreateIndex
CREATE INDEX "TeamMember_status_sortOrder_idx" ON "TeamMember"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMilestone_slug_key" ON "CompanyMilestone"("slug");

-- CreateIndex
CREATE INDEX "CompanyMilestone_status_date_idx" ON "CompanyMilestone"("status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_slug_key" ON "Capability"("slug");

-- CreateIndex
CREATE INDEX "Capability_status_sortOrder_idx" ON "Capability"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Principle_status_sortOrder_idx" ON "Principle"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_sha256_key" ON "MediaAsset"("sha256");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- CreateIndex
CREATE INDEX "ImportJob_kind_createdAt_idx" ON "ImportJob"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJob_fingerprint_idx" ON "ImportJob"("fingerprint");

-- CreateIndex
CREATE INDEX "ImportCandidate_kind_status_confidence_idx" ON "ImportCandidate"("kind", "status", "confidence");

-- CreateIndex
CREATE UNIQUE INDEX "ImportCandidate_kind_fingerprint_key" ON "ImportCandidate"("kind", "fingerprint");

-- CreateIndex
CREATE INDEX "SourceEvidence_sourceType_sourceId_idx" ON "SourceEvidence"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "SourceEvidence_productId_idx" ON "SourceEvidence"("productId");

-- CreateIndex
CREATE INDEX "SourceEvidence_collaborationId_idx" ON "SourceEvidence"("collaborationId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceEvidence_candidateId_sourceType_sourceId_key" ON "SourceEvidence"("candidateId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "_CollaborationToProduct_B_index" ON "_CollaborationToProduct"("B");

-- CreateIndex
CREATE INDEX "_CapabilityToProduct_B_index" ON "_CapabilityToProduct"("B");

-- AddForeignKey
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFeature" ADD CONSTRAINT "ProductFeature_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLink" ADD CONSTRAINT "ProductLink_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationPartner" ADD CONSTRAINT "CollaborationPartner_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationPartner" ADD CONSTRAINT "CollaborationPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TeamGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMilestone" ADD CONSTRAINT "CompanyMilestone_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMilestone" ADD CONSTRAINT "CompanyMilestone_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMilestone" ADD CONSTRAINT "CompanyMilestone_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaBlob" ADD CONSTRAINT "MediaBlob_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportCandidate" ADD CONSTRAINT "ImportCandidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportCandidate" ADD CONSTRAINT "ImportCandidate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportCandidate" ADD CONSTRAINT "ImportCandidate_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportCandidate" ADD CONSTRAINT "ImportCandidate_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "ImportCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceEvidence" ADD CONSTRAINT "SourceEvidence_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ImportCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceEvidence" ADD CONSTRAINT "SourceEvidence_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceEvidence" ADD CONSTRAINT "SourceEvidence_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceEvidence" ADD CONSTRAINT "SourceEvidence_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollaborationToProduct" ADD CONSTRAINT "_CollaborationToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Collaboration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollaborationToProduct" ADD CONSTRAINT "_CollaborationToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapabilityToProduct" ADD CONSTRAINT "_CapabilityToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapabilityToProduct" ADD CONSTRAINT "_CapabilityToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- Publication gates (defense in depth; also enforced in application code).
-- A product, collaboration or milestone can only be PUBLISHED after an owner
-- has verified it. This makes it impossible for an unverified record — e.g. a
-- freshly approved import candidate — to become public by accident.
-- -----------------------------------------------------------------------------
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_published_requires_verification"
  CHECK ("status" <> 'PUBLISHED' OR "verifiedAt" IS NOT NULL);

ALTER TABLE "Collaboration"
  ADD CONSTRAINT "Collaboration_published_requires_verification"
  CHECK ("status" <> 'PUBLISHED' OR "verifiedAt" IS NOT NULL);

ALTER TABLE "CompanyMilestone"
  ADD CONSTRAINT "CompanyMilestone_published_requires_verification"
  CHECK ("status" <> 'PUBLISHED' OR "verifiedAt" IS NOT NULL);

-- Singletons must stay singletons.
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_singleton" CHECK ("id" = 1);
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_singleton" CHECK ("id" = 1);

-- Sanity constraints.
ALTER TABLE "ImportCandidate"
  ADD CONSTRAINT "ImportCandidate_confidence_range" CHECK ("confidence" BETWEEN 0 AND 100);
ALTER TABLE "ImportJob"
  ADD CONSTRAINT "ImportJob_progress_range" CHECK ("progress" BETWEEN 0 AND 100);
