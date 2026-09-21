UPDATE "Member"
SET "vestedAt" = "createdAt" + INTERVAL '21 days'
WHERE "memberStatus" = 'vested'
  AND "associationCode" = 'AIOF'
  AND "lastAndMiddleNames" = 'SUME';
