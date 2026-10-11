ALTER TABLE "AssociationContributionPaymentCode"
DROP CONSTRAINT IF EXISTS "AssociationContributionPaymentCode_codeCents_chk";

ALTER TABLE "AssociationContributionPaymentCode"
ALTER COLUMN "codeCents" DROP DEFAULT,
ALTER COLUMN "codeCents" DROP NOT NULL;

UPDATE "AssociationContributionPaymentCode"
SET "codeCents" = NULL;

ALTER TABLE "AssociationContributionPaymentCode"
ADD CONSTRAINT "AssociationContributionPaymentCode_codeCents_chk"
CHECK ("codeCents" IS NULL OR ("codeCents" >= 0 AND "codeCents" <= 99));
