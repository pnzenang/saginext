ALTER TABLE "DelegateIssueNoteMessage"
ADD COLUMN "documentFileName" TEXT,
ADD COLUMN "documentMimeType" TEXT,
ADD COLUMN "documentFileSize" INTEGER,
ADD COLUMN "cloudinaryPublicId" TEXT,
ADD COLUMN "cloudinarySecureUrl" TEXT,
ADD COLUMN "cloudinaryResourceType" TEXT,
ADD COLUMN "cloudinaryDeliveryType" TEXT,
ADD COLUMN "cloudinaryFormat" TEXT;

CREATE INDEX "DelegateIssueNoteMessage_cloudinaryPublicId_idx" ON "DelegateIssueNoteMessage"("cloudinaryPublicId");
