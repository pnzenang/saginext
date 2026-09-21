UPDATE "Member"
SET "vestedAt" = "vestedAt" + INTERVAL '1 month'
WHERE "memberStatus" = 'vested'
  AND "associationCode" = 'AIOF'
  AND "createdAt" > TIMESTAMP '2025-06-01 00:00:00'
  AND "createdAt" < TIMESTAMP '2026-09-01 00:00:00'
  AND "vestedAt" = "createdAt" - INTERVAL '3 months';
