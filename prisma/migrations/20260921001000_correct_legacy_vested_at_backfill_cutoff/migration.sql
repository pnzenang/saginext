UPDATE "Member"
SET "vestedAt" = NULL
WHERE "memberStatus" = 'vested'
  AND "vestedAt" = "createdAt"
  AND "createdAt" >= TIMESTAMP '2025-06-01 00:00:00'
  AND "createdAt" < TIMESTAMP '2026-06-01 00:00:00';
