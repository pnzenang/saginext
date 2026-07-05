-- CreateTable
CREATE TABLE "AssociationContributionAssessmentDeath" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastAndMiddleNames" TEXT NOT NULL,
    "registrationDate" TEXT NOT NULL,
    "dateOfDeath" TEXT NOT NULL,
    "amountToContribute" DECIMAL(10,2) NOT NULL,
    "associationName" TEXT NOT NULL,
    "associationCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssociationContributionAssessmentDeath_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssociationContributionAssessmentDeath_assessmentId_idx" ON "AssociationContributionAssessmentDeath"("assessmentId");

-- CreateIndex
CREATE INDEX "AssociationContributionAssessmentDeath_memberMatriculationNumber_idx" ON "AssociationContributionAssessmentDeath"("memberMatriculationNumber");

-- CreateIndex
CREATE INDEX "AssociationContributionAssessmentDeath_associationCode_idx" ON "AssociationContributionAssessmentDeath"("associationCode");

-- AddForeignKey
ALTER TABLE "AssociationContributionAssessmentDeath" ADD CONSTRAINT "AssociationContributionAssessmentDeath_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AssociationContributionAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
