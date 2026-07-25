-- Wave 1 hardening: FK from LearningPlanItem.courseId to Course.id + supporting indexes.

-- CreateIndex
CREATE INDEX "Course_published_track_idx" ON "Course"("published", "track");

-- CreateIndex
CREATE INDEX "LearningPlanItem_courseId_idx" ON "LearningPlanItem"("courseId");

-- AddForeignKey
ALTER TABLE "LearningPlanItem" ADD CONSTRAINT "LearningPlanItem_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
