CREATE TABLE "ContributionCalculationDeath" (
    "id" TEXT NOT NULL,
    "deceasedMemberId" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "amountToContribute" DECIMAL(10,2) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCalculationDeath_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContributionCalculationDeath_deceasedMemberId_key" ON "ContributionCalculationDeath"("deceasedMemberId");

CREATE UNIQUE INDEX "ContributionCalculationDeath_memberMatriculationNumber_key" ON "ContributionCalculationDeath"("memberMatriculationNumber");

CREATE INDEX "ContributionCalculationDeath_createdAt_idx" ON "ContributionCalculationDeath"("createdAt");

ALTER TABLE "ContributionCalculationDeath" ADD CONSTRAINT "ContributionCalculationDeath_deceasedMemberId_fkey" FOREIGN KEY ("deceasedMemberId") REFERENCES "DeceasedMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
