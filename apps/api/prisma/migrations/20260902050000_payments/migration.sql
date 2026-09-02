-- Patch-20 (LMS Phase 5): per-course pricing + Paystack purchases.
ALTER TABLE "Course" ADD COLUMN "priceKobo" INTEGER;
ALTER TABLE "Course" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'NGN';

CREATE TABLE "Purchase" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "courseSlug" TEXT NOT NULL,
  "amountKobo" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "courseId" TEXT,
  CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Purchase_reference_key" ON "Purchase"("reference");
CREATE INDEX "Purchase_status_createdAt_idx" ON "Purchase"("status", "createdAt");
CREATE INDEX "Purchase_email_idx" ON "Purchase"("email");
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
