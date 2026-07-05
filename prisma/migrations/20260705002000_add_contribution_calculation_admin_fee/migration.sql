CREATE TABLE "ContributionCalculationAdminFee" (
    "id" TEXT NOT NULL DEFAULT 'current',
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCalculationAdminFee_pkey" PRIMARY KEY ("id")
);
