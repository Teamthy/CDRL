-- Patch-27: long-form detail body for course pages (markdown-lite, rendered by ModuleText).
ALTER TABLE "Course" ADD COLUMN "details" TEXT;
