-- Audit P1-13: retention sweeps and the admin inbox had no index to stand on.

-- RefreshToken: expired/consumed rows are purged by expiresAt.
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- LearningPlan: anonymous session plans are swept once they go cold.
CREATE INDEX IF NOT EXISTS "LearningPlan_updatedAt_idx" ON "LearningPlan"("updatedAt");

-- ContactEnquiry: the admin inbox filters by status and orders by createdAt.
CREATE INDEX IF NOT EXISTS "ContactEnquiry_status_createdAt_idx" ON "ContactEnquiry"("status", "createdAt");
