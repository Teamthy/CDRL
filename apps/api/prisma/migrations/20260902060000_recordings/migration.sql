-- Patch-22: session recordings per course (links only — YouTube/Drive/Vimeo hosts).
CREATE TABLE "Recording" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Recording_courseId_order_idx" ON "Recording"("courseId", "order");
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
