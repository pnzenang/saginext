ALTER TABLE "AssociationPaymentLedgerEntry"
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancelledBy" TEXT,
  ADD COLUMN "cancellationReason" TEXT;

CREATE INDEX "AssociationPaymentLedgerEntry_cancelledAt_idx" ON "AssociationPaymentLedgerEntry"("cancelledAt");
