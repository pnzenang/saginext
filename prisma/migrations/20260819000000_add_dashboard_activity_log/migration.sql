CREATE TABLE "DashboardActivityLog" (
    "id" TEXT NOT NULL,
    "dashboardScope" TEXT NOT NULL,
    "associationCode" TEXT,
    "actorClerkId" TEXT NOT NULL,
    "actorEmail" TEXT,
    "actorAssociationCode" TEXT,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DashboardActivityLog_dashboardScope_createdAt_idx" ON "DashboardActivityLog"("dashboardScope", "createdAt");
CREATE INDEX "DashboardActivityLog_associationCode_createdAt_idx" ON "DashboardActivityLog"("associationCode", "createdAt");
CREATE INDEX "DashboardActivityLog_actorClerkId_createdAt_idx" ON "DashboardActivityLog"("actorClerkId", "createdAt");
CREATE INDEX "DashboardActivityLog_action_createdAt_idx" ON "DashboardActivityLog"("action", "createdAt");
CREATE INDEX "DashboardActivityLog_entityType_entityId_idx" ON "DashboardActivityLog"("entityType", "entityId");
