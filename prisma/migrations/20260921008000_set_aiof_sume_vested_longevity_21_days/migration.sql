UPDATE "Member"
SET "vestedAt" = CURRENT_DATE - INTERVAL '21 days'
WHERE "memberStatus" = 'vested'
  AND "associationCode" = 'AIOF'
  AND "lastAndMiddleNames" = 'SUME';
