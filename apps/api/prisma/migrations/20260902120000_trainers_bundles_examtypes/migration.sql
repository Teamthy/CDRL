-- Patch-33: trainers, bundles, exam-type events, course price bands (PECB parity)
ALTER TABLE "Course" ADD COLUMN "priceBand" JSONB;
ALTER TABLE "Event" ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'cohort';

CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "photoUrl" TEXT,
    "linkedIn" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Trainer_slug_key" ON "Trainer"("slug");
CREATE INDEX "Trainer_published_idx" ON "Trainer"("published");

CREATE TABLE "CourseTrainer" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Lead instructor',
    CONSTRAINT "CourseTrainer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CourseTrainer_courseId_trainerId_key" ON "CourseTrainer"("courseId", "trainerId");
CREATE INDEX "CourseTrainer_trainerId_idx" ON "CourseTrainer"("trainerId");
ALTER TABLE "CourseTrainer" ADD CONSTRAINT "CourseTrainer_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseTrainer" ADD CONSTRAINT "CourseTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "details" TEXT,
    "priceKobo" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "savingsNote" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Bundle_slug_key" ON "Bundle"("slug");
CREATE INDEX "Bundle_published_idx" ON "Bundle"("published");

CREATE TABLE "BundleCourse" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BundleCourse_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BundleCourse_bundleId_courseId_key" ON "BundleCourse"("bundleId", "courseId");
CREATE INDEX "BundleCourse_courseId_idx" ON "BundleCourse"("courseId");
ALTER TABLE "BundleCourse" ADD CONSTRAINT "BundleCourse_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BundleCourse" ADD CONSTRAINT "BundleCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
