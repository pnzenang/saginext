UPDATE "Member"
SET "vestedAt" = "updatedAt"
WHERE "memberStatus" = 'vested'
  AND "vestedAt" IS NULL;
