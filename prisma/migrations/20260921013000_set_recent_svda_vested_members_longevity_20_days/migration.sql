WITH ranked_members AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt" DESC, id DESC) AS rank
  FROM "Member"
  WHERE "memberStatus" = 'vested'
    AND "associationCode" = 'SVDA'
)
UPDATE "Member" member
SET "vestedAt" = CURRENT_DATE - INTERVAL '20 days'
FROM ranked_members
WHERE member.id = ranked_members.id
  AND ranked_members.rank <= 4;
