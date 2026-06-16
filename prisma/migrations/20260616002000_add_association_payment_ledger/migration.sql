CREATE TABLE "AssociationPaymentLedgerEntry" (
  "id" TEXT NOT NULL,
  "associationCode" TEXT NOT NULL,
  "paymentType" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "note" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AssociationPaymentLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AssociationPaymentLedgerEntry_associationCode_idx" ON "AssociationPaymentLedgerEntry"("associationCode");
CREATE INDEX "AssociationPaymentLedgerEntry_paymentType_idx" ON "AssociationPaymentLedgerEntry"("paymentType");
CREATE INDEX "AssociationPaymentLedgerEntry_eventType_idx" ON "AssociationPaymentLedgerEntry"("eventType");
CREATE INDEX "AssociationPaymentLedgerEntry_createdAt_idx" ON "AssociationPaymentLedgerEntry"("createdAt");
