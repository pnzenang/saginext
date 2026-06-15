-- Baseline for the existing SAGI schema already present in production.
-- This migration is intended to be marked as applied, not re-run against an existing database.

CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "associationName" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "firstDelegateFullName" TEXT NOT NULL,
    "firstDelegatePhoneNumber" TEXT NOT NULL,
    "firstDelegateEmail" TEXT NOT NULL,
    "secondDelegateFullName" TEXT NOT NULL,
    "secondDelegatePhoneNumber" TEXT NOT NULL,
    "secondDelegateEmail" TEXT NOT NULL,
    "thirdDelegateFullName" TEXT NOT NULL,
    "thirdDelegatePhoneNumber" TEXT NOT NULL,
    "thirdDelegateEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastAndMiddleNames" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "countryOfBirth" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "delegateRecommendation" TEXT NOT NULL,
    "memberStatus" TEXT NOT NULL,
    "nameOfBeneficiary" TEXT NOT NULL,
    "associationName" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RemovedMember" (
    "id" TEXT NOT NULL,
    "originalMemberId" TEXT,
    "clerkId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastAndMiddleNames" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "countryOfBirth" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "registrationDate" TEXT NOT NULL,
    "associationName" TEXT,
    "associationCode" TEXT NOT NULL,
    "nameOfBeneficiary" TEXT,
    "delegateRecommendation" TEXT,
    "memberStatus" TEXT,
    "reasonForLeaving" TEXT NOT NULL,
    "originalMemberCreatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RemovedMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeceasedMember" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastAndMiddleNames" TEXT NOT NULL,
    "countryOfBirth" TEXT NOT NULL,
    "memberMatriculationNumber" TEXT NOT NULL,
    "registrationDate" TEXT NOT NULL,
    "nameOfBeneficiary" TEXT NOT NULL,
    "associationName" TEXT NOT NULL,
    "dateOfDeath" TEXT NOT NULL,
    "placeOfDeath" TEXT NOT NULL,
    "contributionStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeceasedMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Profile_clerkId_key" ON "Profile"("clerkId");

CREATE UNIQUE INDEX "Profile_associationCode_key" ON "Profile"("associationCode");

CREATE UNIQUE INDEX "Member_firstName_lastAndMiddleNames_dateOfBirth_delegateRecommendation_key" ON "Member"("firstName", "lastAndMiddleNames", "dateOfBirth", "delegateRecommendation");
