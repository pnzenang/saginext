-- Add Cloudinary-backed document storage while preserving older database-backed files.
ALTER TABLE "DeceasedMemberDocument" ALTER COLUMN "fileData" DROP NOT NULL;

ALTER TABLE "DeceasedMemberDocument"
ADD COLUMN "cloudinaryPublicId" TEXT,
ADD COLUMN "cloudinarySecureUrl" TEXT,
ADD COLUMN "cloudinaryResourceType" TEXT,
ADD COLUMN "cloudinaryDeliveryType" TEXT,
ADD COLUMN "cloudinaryFormat" TEXT;

ALTER TABLE "NameChangeRequest"
ADD COLUMN "cloudinaryPublicId" TEXT,
ADD COLUMN "cloudinarySecureUrl" TEXT,
ADD COLUMN "cloudinaryResourceType" TEXT,
ADD COLUMN "cloudinaryDeliveryType" TEXT,
ADD COLUMN "cloudinaryFormat" TEXT;

CREATE INDEX "DeceasedMemberDocument_cloudinaryPublicId_idx" ON "DeceasedMemberDocument"("cloudinaryPublicId");
CREATE INDEX "NameChangeRequest_cloudinaryPublicId_idx" ON "NameChangeRequest"("cloudinaryPublicId");
