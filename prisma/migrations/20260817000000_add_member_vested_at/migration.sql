ALTER TABLE "Member"
ADD COLUMN "vestedAt" TIMESTAMP(3);

UPDATE "Member"
SET "vestedAt" = "updatedAt"
WHERE "memberStatus" = 'Vested'
  AND "vestedAt" IS NULL;

CREATE INDEX "Member_vestedAt_idx" ON "Member"("vestedAt");

ALTER TABLE "RemovedMember"
ADD COLUMN "originalMemberVestedAt" TIMESTAMP(3);

ALTER TABLE "DeceasedMember"
ADD COLUMN "originalMemberVestedAt" TIMESTAMP(3);
