ALTER TABLE "AssociationContributionAssessment"
ADD COLUMN IF NOT EXISTS "deathCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "_AssociationContributionAssessmentDeathCountBackup" (
  "id" TEXT PRIMARY KEY,
  "deathCount" INTEGER NOT NULL DEFAULT 0
);

UPDATE "AssociationContributionAssessment" AS assessment
SET "deathCount" = backup."deathCount"
FROM "_AssociationContributionAssessmentDeathCountBackup" AS backup
WHERE assessment."id" = backup."id";

DROP TABLE IF EXISTS "_AssociationContributionAssessmentDeathCountBackup";
