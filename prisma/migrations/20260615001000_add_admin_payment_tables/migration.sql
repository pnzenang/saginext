CREATE TABLE "AssociationContributionPayment" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "amountSent" DECIMAL(10,2) NOT NULL,
    "amountVerified" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastSubmittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationContributionPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssociationRegistrationPayment" (
    "id" TEXT NOT NULL,
    "associationCode" TEXT NOT NULL,
    "amountSent" DECIMAL(10,2) NOT NULL,
    "amountVerified" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastSubmittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationRegistrationPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssociationContributionPayment_associationCode_key" ON "AssociationContributionPayment"("associationCode");

CREATE INDEX "AssociationContributionPayment_associationCode_idx" ON "AssociationContributionPayment"("associationCode");

CREATE INDEX "AssociationContributionPayment_lastSubmittedAt_idx" ON "AssociationContributionPayment"("lastSubmittedAt");

CREATE UNIQUE INDEX "AssociationRegistrationPayment_associationCode_key" ON "AssociationRegistrationPayment"("associationCode");

CREATE INDEX "AssociationRegistrationPayment_associationCode_idx" ON "AssociationRegistrationPayment"("associationCode");

CREATE INDEX "AssociationRegistrationPayment_lastSubmittedAt_idx" ON "AssociationRegistrationPayment"("lastSubmittedAt");
