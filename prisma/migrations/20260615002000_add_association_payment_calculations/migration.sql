-- CreateTable
CREATE TABLE "AssociationContributionAssessment" (
    "id" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "totalVestedMembers" INTEGER NOT NULL,
    "amountPerVestedMember" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationContributionAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssociationContributionAssessmentGroup" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "vestedMembersCount" INTEGER NOT NULL,
    "amountOwed" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationContributionAssessmentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssociationContributionUsage" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "amountUsed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationContributionUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssociationContributionCredit" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "amountCredited" DECIMAL(10,2) NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationContributionCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssociationRegistrationUsage" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "amountUsed" DECIMAL(10,2) NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationRegistrationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssociationBalanceAdjustment" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "balanceType" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationBalanceAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssociationContributionAssessmentGroup_assessmentId_associationCode_key" ON "AssociationContributionAssessmentGroup"("assessmentId", "associationCode");

-- CreateIndex
CREATE INDEX "AssociationContributionAssessmentGroup_associationCode_idx" ON "AssociationContributionAssessmentGroup"("associationCode");

-- CreateIndex
CREATE UNIQUE INDEX "AssociationContributionUsage_associationCode_key" ON "AssociationContributionUsage"("associationCode");

-- CreateIndex
CREATE INDEX "AssociationContributionUsage_associationCode_idx" ON "AssociationContributionUsage"("associationCode");

-- CreateIndex
CREATE UNIQUE INDEX "AssociationContributionCredit_memberMatriculationNumber_key" ON "AssociationContributionCredit"("memberMatriculationNumber");

-- CreateIndex
CREATE INDEX "AssociationContributionCredit_associationCode_idx" ON "AssociationContributionCredit"("associationCode");

-- CreateIndex
CREATE UNIQUE INDEX "AssociationRegistrationUsage_memberMatriculationNumber_key" ON "AssociationRegistrationUsage"("memberMatriculationNumber");

-- CreateIndex
CREATE INDEX "AssociationRegistrationUsage_associationCode_idx" ON "AssociationRegistrationUsage"("associationCode");

-- CreateIndex
CREATE UNIQUE INDEX "AssociationBalanceAdjustment_associationCode_balanceType_key" ON "AssociationBalanceAdjustment"("associationCode", "balanceType");

-- CreateIndex
CREATE INDEX "AssociationBalanceAdjustment_associationCode_idx" ON "AssociationBalanceAdjustment"("associationCode");

-- CreateIndex
CREATE INDEX "AssociationBalanceAdjustment_balanceType_idx" ON "AssociationBalanceAdjustment"("balanceType");

-- AddForeignKey
ALTER TABLE "AssociationContributionAssessmentGroup" ADD CONSTRAINT "AssociationContributionAssessmentGroup_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssociationContributionAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill active pending members into registration usage.
INSERT INTO "AssociationRegistrationUsage" (
    "id",
    "associationCode",
    "memberMatriculationNumber",
    "amountUsed",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT('reg_', "memberMatriculationNumber"),
    "associationCode",
    "memberMatriculationNumber",
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Member"
WHERE "memberStatus" = 'pending'
ON CONFLICT ("memberMatriculationNumber") DO NOTHING;

-- Backfill active vested members into contribution credits.
INSERT INTO "AssociationContributionCredit" (
    "id",
    "associationCode",
    "memberMatriculationNumber",
    "amountCredited",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT('credit_', "memberMatriculationNumber"),
    "associationCode",
    "memberMatriculationNumber",
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Member"
WHERE "memberStatus" = 'vested'
ON CONFLICT ("memberMatriculationNumber") DO NOTHING;
