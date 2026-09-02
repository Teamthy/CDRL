-- patch-44: per-student module completion tracking (learner self-service progress)
CREATE TABLE "ModuleCompletion" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ModuleCompletion_studentId_moduleId_key" ON "ModuleCompletion"("studentId", "moduleId");
CREATE INDEX "ModuleCompletion_studentId_courseId_idx" ON "ModuleCompletion"("studentId", "courseId");

ALTER TABLE "ModuleCompletion" ADD CONSTRAINT "ModuleCompletion_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "LmsUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModuleCompletion" ADD CONSTRAINT "ModuleCompletion_moduleId_fkey"
    FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
