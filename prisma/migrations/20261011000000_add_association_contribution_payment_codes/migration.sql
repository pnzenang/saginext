CREATE TABLE "AssociationContributionPaymentCode" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "codeCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationContributionPaymentCode_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AssociationContributionPaymentCode_codeCents_chk" CHECK ("codeCents" >= 0 AND "codeCents" <= 99)
);

CREATE UNIQUE INDEX "AssociationContributionPaymentCode_associationCode_key" ON "AssociationContributionPaymentCode"("associationCode");

CREATE INDEX "AssociationContributionPaymentCode_associationCode_idx" ON "AssociationContributionPaymentCode"("associationCode");

WITH association_codes AS (
    SELECT DISTINCT trim(association_code) AS association_code
    FROM (
        SELECT "associationCode" AS association_code FROM "Profile"
        UNION
        SELECT "associationCode" AS association_code FROM "Member"
        UNION
        SELECT "associationCode" AS association_code FROM "AssociationContributionPayment"
        UNION
        SELECT "associationCode" AS association_code FROM "AssociationContributionAssessmentGroup"
        UNION
        SELECT "associationCode" AS association_code FROM "AssociationContributionUsage"
        UNION
        SELECT "associationCode" AS association_code FROM "AssociationBalanceAdjustment"
    ) codes
    WHERE trim(association_code) <> ''
),
numbered_codes AS (
    SELECT
        association_code,
        (row_number() OVER (ORDER BY association_code) - 1) % 100 AS code_cents
    FROM association_codes
)
INSERT INTO "AssociationContributionPaymentCode" ("id", "associationCode", "codeCents", "createdAt", "updatedAt")
SELECT
    'association-contribution-payment-code-' || association_code,
    association_code,
    code_cents,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM numbered_codes
ON CONFLICT ("associationCode") DO NOTHING;
