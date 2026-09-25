WITH targets("associationCode", requested_count) AS (
  VALUES
    ('GOOD', 2),
    ('HENC', 4),
    ('HUFA', 1),
    ('JSTT', 3),
    ('KENT', 1),
    ('KONI', 3),
    ('KUPE', 2),
    ('LBLM', 3),
    ('MASE', 2),
    ('MBAC', 1),
    ('MBCA', 7),
    ('MBEA', 2),
    ('MCDC', 1),
    ('MCDA', 1),
    ('MEEK', 1),
    ('MNGR', 2),
    ('MOGH', 9),
    ('MOLA', 2),
    ('NDAG', 1),
    ('NMNE', 1),
    ('NOWE', 4),
    ('PDOU', 1),
    ('PHCA', 3),
    ('SEUF', 1),
    ('SHSA', 5),
    ('SOBA', 1),
    ('SVDA', 1),
    ('TKLI', 5)
),
ranked_members AS (
  SELECT
    member.id,
    targets.requested_count,
    ROW_NUMBER() OVER (
      PARTITION BY member."associationCode"
      ORDER BY member."createdAt" DESC, member.id DESC
    ) AS rank
  FROM "Member" member
  INNER JOIN targets ON targets."associationCode" = member."associationCode"
  WHERE member."memberStatus" = 'vested'
)
UPDATE "Member" member
SET "vestedAt" = CURRENT_DATE - INTERVAL '20 days'
FROM ranked_members
WHERE member.id = ranked_members.id
  AND ranked_members.rank <= ranked_members.requested_count;
