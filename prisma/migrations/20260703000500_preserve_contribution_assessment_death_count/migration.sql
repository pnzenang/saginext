DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'AssociationContributionAssessment'
      AND column_name = 'deathCount'
  ) THEN
    CREATE TABLE IF NOT EXISTS "_AssociationContributionAssessmentDeathCountBackup" (
      "id" TEXT PRIMARY KEY,
      "deathCount" INTEGER NOT NULL DEFAULT 0
    );

    INSERT INTO "_AssociationContributionAssessmentDeathCountBackup" ("id", "deathCount")
    SELECT "id", "deathCount"
    FROM "AssociationContributionAssessment"
    ON CONFLICT ("id") DO UPDATE
    SET "deathCount" = EXCLUDED."deathCount";
  END IF;
END $$;
