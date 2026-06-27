ALTER TABLE "DeceasedMember" ADD COLUMN "associationCode" TEXT;

CREATE TABLE "DeceasedMemberDocument" (
    "id" TEXT NOT NULL,
    "deceasedMemberId" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "associationCode" TEXT,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileData" BYTEA NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeceasedMemberDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NameChangeRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "currentFirstName" TEXT NOT NULL,
    "currentLastAndMiddleNames" TEXT NOT NULL,
    "requestedFirstName" TEXT NOT NULL,
    "requestedLastAndMiddleNames" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "documentRequired" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "fileData" BYTEA,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NameChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberTransferRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "initiatingClerkId" TEXT NOT NULL,
    "initiatingAssociationCode" TEXT NOT NULL,
    "receivingClerkId" TEXT NOT NULL,
    "receivingAssociationCode" TEXT NOT NULL,
    "currentFirstName" TEXT NOT NULL,
    "currentLastAndMiddleNames" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'receiving_delegate_pending',
    "rejectionReason" TEXT,
    "receivingReviewedBy" TEXT,
    "receivingReviewedAt" TIMESTAMP(3),
    "adminReviewedBy" TEXT,
    "adminReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberTransferRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DeceasedMemberDocument_deceasedMemberId_documentType_key" ON "DeceasedMemberDocument"("deceasedMemberId", "documentType");
CREATE INDEX "DeceasedMemberDocument_deceasedMemberId_idx" ON "DeceasedMemberDocument"("deceasedMemberId");
CREATE INDEX "DeceasedMemberDocument_associationCode_idx" ON "DeceasedMemberDocument"("associationCode");
CREATE INDEX "DeceasedMemberDocument_clerkId_idx" ON "DeceasedMemberDocument"("clerkId");
CREATE INDEX "DeceasedMemberDocument_status_idx" ON "DeceasedMemberDocument"("status");

CREATE INDEX "NameChangeRequest_memberId_idx" ON "NameChangeRequest"("memberId");
CREATE INDEX "NameChangeRequest_clerkId_idx" ON "NameChangeRequest"("clerkId");
CREATE INDEX "NameChangeRequest_associationCode_idx" ON "NameChangeRequest"("associationCode");
CREATE INDEX "NameChangeRequest_status_idx" ON "NameChangeRequest"("status");
CREATE INDEX "NameChangeRequest_createdAt_idx" ON "NameChangeRequest"("createdAt");

CREATE INDEX "MemberTransferRequest_memberId_idx" ON "MemberTransferRequest"("memberId");
CREATE INDEX "MemberTransferRequest_initiatingClerkId_idx" ON "MemberTransferRequest"("initiatingClerkId");
CREATE INDEX "MemberTransferRequest_receivingClerkId_idx" ON "MemberTransferRequest"("receivingClerkId");
CREATE INDEX "MemberTransferRequest_initiatingAssociationCode_idx" ON "MemberTransferRequest"("initiatingAssociationCode");
CREATE INDEX "MemberTransferRequest_receivingAssociationCode_idx" ON "MemberTransferRequest"("receivingAssociationCode");
CREATE INDEX "MemberTransferRequest_status_idx" ON "MemberTransferRequest"("status");
CREATE INDEX "MemberTransferRequest_createdAt_idx" ON "MemberTransferRequest"("createdAt");

ALTER TABLE "DeceasedMemberDocument" ADD CONSTRAINT "DeceasedMemberDocument_deceasedMemberId_fkey" FOREIGN KEY ("deceasedMemberId") REFERENCES "DeceasedMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NameChangeRequest" ADD CONSTRAINT "NameChangeRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MemberTransferRequest" ADD CONSTRAINT "MemberTransferRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
