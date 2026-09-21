UPDATE "Member"
SET "vestedAt" = CASE
  WHEN "associationCode" = 'AIOF' THEN "createdAt" + INTERVAL '5 months'
  ELSE "createdAt" + INTERVAL '6 months'
END
WHERE "memberStatus" = 'vested'
  AND "createdAt" > TIMESTAMP '2025-06-01 00:00:00'
  AND "createdAt" < TIMESTAMP '2026-09-01 00:00:00';
