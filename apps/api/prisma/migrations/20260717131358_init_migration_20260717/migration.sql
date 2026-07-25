-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "deliveryMode" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "interest" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPlan" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPlanItem" (
    "id" TEXT NOT NULL,
    "learningPlanId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SiteContent_pageKey_key" ON "SiteContent"("pageKey");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPlan_sessionId_key" ON "LearningPlan"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPlanItem_learningPlanId_courseId_key" ON "LearningPlanItem"("learningPlanId", "courseId");

-- AddForeignKey
ALTER TABLE "LearningPlanItem" ADD CONSTRAINT "LearningPlanItem_learningPlanId_fkey" FOREIGN KEY ("learningPlanId") REFERENCES "LearningPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
