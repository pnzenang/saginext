UPDATE "Member"
SET "vestedAt" = "createdAt"
WHERE "memberStatus" = 'vested'
  AND "vestedAt" IS NULL
  AND "createdAt" < TIMESTAMP '2026-06-01 00:00:00';
