-- Backfill active pending members that are missing registration usage.
INSERT INTO "AssociationRegistrationUsage" (
    "id",
    "associationCode",
    "memberMatriculationNumber",
    "amountUsed",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT('reg_', m."memberMatriculationNumber"),
    m."associationCode",
    m."memberMatriculationNumber",
    20,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Member" m
WHERE m."memberStatus" = 'pending'
AND NOT EXISTS (
    SELECT 1
    FROM "AssociationRegistrationUsage" u
    WHERE u."memberMatriculationNumber" = m."memberMatriculationNumber"
)
ON CONFLICT ("memberMatriculationNumber") DO UPDATE SET
    "associationCode" = EXCLUDED."associationCode",
    "amountUsed" = EXCLUDED."amountUsed",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Registration usage is calculated from active members, so remove stale rows.
DELETE FROM "AssociationRegistrationUsage" u
WHERE NOT EXISTS (
    SELECT 1
    FROM "Member" m
    WHERE m."memberMatriculationNumber" = u."memberMatriculationNumber"
);
