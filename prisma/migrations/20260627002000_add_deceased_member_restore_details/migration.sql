ALTER TABLE "DeceasedMember"
ADD COLUMN "originalMemberId" TEXT,
ADD COLUMN "dateOfBirth" TEXT,
ADD COLUMN "delegateRecommendation" TEXT,
ADD COLUMN "memberStatus" TEXT,
ADD COLUMN "originalMemberCreatedAt" TIMESTAMP(3);
