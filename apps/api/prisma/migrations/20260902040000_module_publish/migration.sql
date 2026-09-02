-- Patch-19 (LMS Phase 3): draft/publish lifecycle for course modules.
-- Existing modules stay visible (default true).
ALTER TABLE "CourseModule" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true;
