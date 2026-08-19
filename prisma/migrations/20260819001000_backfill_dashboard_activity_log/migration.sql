INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:profile:' || p."id",
  'association',
  p."associationCode",
  p."clerkId",
  NULLIF(p."firstDelegateEmail", ''),
  p."associationCode",
  NULLIF(p."associationName", ''),
  'profile_created',
  'profile',
  p."id",
  'Created association profile for ' || p."associationName" || ' (' || p."associationCode" || ').',
  jsonb_build_object('backfilled', true),
  p."createdAt"
FROM "Profile" p
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:profile:' || p."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:member:' || m."id",
  'association',
  m."associationCode",
  m."clerkId",
  NULLIF(p."firstDelegateEmail", ''),
  p."associationCode",
  NULLIF(p."associationName", ''),
  'member_created',
  'member',
  m."id",
  'Added ' || m."firstName" || ' ' || m."lastAndMiddleNames" || ' (' || m."memberMatriculationNumber" || ') with ' || m."memberStatus" || ' status.',
  jsonb_build_object('backfilled', true),
  m."createdAt"
FROM "Member" m
LEFT JOIN "Profile" p ON p."associationCode" = m."associationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:member:' || m."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:removed-member:' || r."id",
  'association',
  r."associationCode",
  r."clerkId",
  NULLIF(p."firstDelegateEmail", ''),
  p."associationCode",
  NULLIF(p."associationName", ''),
  'member_removed',
  'member',
  r."id",
  'Removed ' || r."firstName" || ' ' || r."lastAndMiddleNames" || ' (' || r."memberMatriculationNumber" || '). Reason: ' || r."reasonForLeaving" || '.',
  jsonb_build_object('backfilled', true),
  r."createdAt"
FROM "RemovedMember" r
LEFT JOIN "Profile" p ON p."associationCode" = r."associationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:removed-member:' || r."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:deceased-member:' || d."id",
  'association',
  d."associationCode",
  d."clerkId",
  NULLIF(p."firstDelegateEmail", ''),
  p."associationCode",
  NULLIF(p."associationName", ''),
  'death_announced',
  'deceased_member',
  d."id",
  'Moved ' || d."firstName" || ' ' || d."lastAndMiddleNames" || ' (' || d."memberMatriculationNumber" || ') to deceased members. Date of death: ' || d."dateOfDeath" || '.',
  jsonb_build_object('backfilled', true),
  d."createdAt"
FROM "DeceasedMember" d
LEFT JOIN "Profile" p ON p."associationCode" = d."associationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:deceased-member:' || d."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:death-document:' || doc."id",
  'association',
  doc."associationCode",
  doc."clerkId",
  NULLIF(p."firstDelegateEmail", ''),
  p."associationCode",
  NULLIF(p."associationName", ''),
  'death_document_uploaded',
  'death_documentation',
  doc."id",
  'Uploaded ' || replace(doc."documentType", '_', ' ') || ' for a death announcement.',
  jsonb_build_object('backfilled', true, 'status', doc."status"),
  doc."createdAt"
FROM "DeceasedMemberDocument" doc
LEFT JOIN "Profile" p ON p."associationCode" = doc."associationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:death-document:' || doc."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:name-change:' || n."id",
  'association',
  n."associationCode",
  n."clerkId",
  NULLIF(p."firstDelegateEmail", ''),
  p."associationCode",
  NULLIF(p."associationName", ''),
  'name_change_requested',
  'name_change',
  n."id",
  'Requested name change from ' || n."currentFirstName" || ' ' || n."currentLastAndMiddleNames" || ' to ' || n."requestedFirstName" || ' ' || n."requestedLastAndMiddleNames" || '.',
  jsonb_build_object('backfilled', true, 'status', n."status"),
  n."createdAt"
FROM "NameChangeRequest" n
LEFT JOIN "Profile" p ON p."associationCode" = n."associationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:name-change:' || n."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:member-transfer:' || t."id",
  'association',
  t."initiatingAssociationCode",
  t."initiatingClerkId",
  NULLIF(p."firstDelegateEmail", ''),
  p."associationCode",
  NULLIF(p."associationName", ''),
  'member_transfer_requested',
  'member_transfer',
  t."id",
  'Requested transfer for ' || t."currentFirstName" || ' ' || t."currentLastAndMiddleNames" || ' (' || t."memberMatriculationNumber" || ') from ' || t."initiatingAssociationCode" || ' to ' || t."receivingAssociationCode" || '.',
  jsonb_build_object('backfilled', true, 'status', t."status"),
  t."createdAt"
FROM "MemberTransferRequest" t
LEFT JOIN "Profile" p ON p."associationCode" = t."initiatingAssociationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:member-transfer:' || t."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:message:' || note."id",
  CASE WHEN note."createdByRole" = 'admin' THEN 'admin' ELSE 'association' END,
  note."associationCode",
  note."createdByClerkId",
  CASE WHEN note."createdByRole" = 'admin' THEN 'info@sagiusa.org' ELSE NULLIF(p."firstDelegateEmail", '') END,
  p."associationCode",
  NULLIF(p."associationName", ''),
  'message_created',
  'message',
  note."id",
  CASE
    WHEN note."createdByRole" = 'admin' THEN 'Sent message to ' || note."associationCode" || ': ' || note."subject" || '.'
    ELSE 'Sent message to admin: ' || note."subject" || '.'
  END,
  jsonb_build_object('backfilled', true, 'status', note."status"),
  note."createdAt"
FROM "DelegateIssueNote" note
LEFT JOIN "Profile" p ON p."associationCode" = note."associationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:message:' || note."id"
);

INSERT INTO "DashboardActivityLog" (
  "id",
  "dashboardScope",
  "associationCode",
  "actorClerkId",
  "actorEmail",
  "actorAssociationCode",
  "actorName",
  "action",
  "entityType",
  "entityId",
  "summary",
  "metadata",
  "createdAt"
)
SELECT
  'backfill:payment-ledger:' || ledger."id",
  CASE
    WHEN ledger."eventType" = 'submitted' AND ledger."createdBy" = p."clerkId" THEN 'association'
    ELSE 'admin'
  END,
  ledger."associationCode",
  COALESCE(ledger."createdBy", p."clerkId", '__system__'),
  CASE
    WHEN ledger."createdBy" = p."clerkId" THEN NULLIF(p."firstDelegateEmail", '')
    ELSE 'info@sagiusa.org'
  END,
  p."associationCode",
  NULLIF(p."associationName", ''),
  ledger."paymentType" || '_payment_' || ledger."eventType",
  'payment',
  ledger."id",
  upper(substring(ledger."paymentType" from 1 for 1)) || substring(ledger."paymentType" from 2) || ' payment ' || replace(ledger."eventType", '_', ' ') || ' for ' || ledger."associationCode" || ': $' || to_char(ledger."amount", 'FM999999999.00') || '.',
  jsonb_build_object('backfilled', true, 'paymentType', ledger."paymentType", 'eventType', ledger."eventType"),
  ledger."createdAt"
FROM "AssociationPaymentLedgerEntry" ledger
LEFT JOIN "Profile" p ON p."associationCode" = ledger."associationCode"
WHERE NOT EXISTS (
  SELECT 1 FROM "DashboardActivityLog" log WHERE log."id" = 'backfill:payment-ledger:' || ledger."id"
);
