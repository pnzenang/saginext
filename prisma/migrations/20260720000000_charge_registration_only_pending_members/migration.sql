-- Registration fees are only charged for currently pending members.
-- Remove stale rows for vested, awaiting-publication, delinquent, removed, or missing members.
DELETE FROM "AssociationRegistrationUsage" u
WHERE NOT EXISTS (
    SELECT 1
    FROM "Member" m
    WHERE m."memberMatriculationNumber" = u."memberMatriculationNumber"
    AND m."memberStatus" = 'pending'
);

-- Keep any remaining pending-member usage rows aligned with the fixed registration fee.
UPDATE "AssociationRegistrationUsage" u
SET "amountUsed" = 20,
    "updatedAt" = CURRENT_TIMESTAMP
FROM "Member" m
WHERE m."memberMatriculationNumber" = u."memberMatriculationNumber"
AND m."memberStatus" = 'pending'
AND u."amountUsed" <> 20;
