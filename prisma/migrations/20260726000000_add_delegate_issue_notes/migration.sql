CREATE TABLE "DelegateIssueNote" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "associationName" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdByClerkId" TEXT NOT NULL,
    "createdByRole" TEXT NOT NULL,
    "lastMessageByRole" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delegateUnread" BOOLEAN NOT NULL DEFAULT false,
    "adminUnread" BOOLEAN NOT NULL DEFAULT false,
    "delegateLastReadAt" TIMESTAMP(3),
    "adminLastReadAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedByClerkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelegateIssueNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DelegateIssueNoteMessage" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "authorClerkId" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DelegateIssueNoteMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DelegateIssueNote_associationCode_idx" ON "DelegateIssueNote"("associationCode");
CREATE INDEX "DelegateIssueNote_status_idx" ON "DelegateIssueNote"("status");
CREATE INDEX "DelegateIssueNote_priority_idx" ON "DelegateIssueNote"("priority");
CREATE INDEX "DelegateIssueNote_delegateUnread_idx" ON "DelegateIssueNote"("delegateUnread");
CREATE INDEX "DelegateIssueNote_adminUnread_idx" ON "DelegateIssueNote"("adminUnread");
CREATE INDEX "DelegateIssueNote_lastMessageAt_idx" ON "DelegateIssueNote"("lastMessageAt");
CREATE INDEX "DelegateIssueNoteMessage_noteId_idx" ON "DelegateIssueNoteMessage"("noteId");
CREATE INDEX "DelegateIssueNoteMessage_authorClerkId_idx" ON "DelegateIssueNoteMessage"("authorClerkId");
CREATE INDEX "DelegateIssueNoteMessage_createdAt_idx" ON "DelegateIssueNoteMessage"("createdAt");

ALTER TABLE "DelegateIssueNoteMessage"
ADD CONSTRAINT "DelegateIssueNoteMessage_noteId_fkey"
FOREIGN KEY ("noteId") REFERENCES "DelegateIssueNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
