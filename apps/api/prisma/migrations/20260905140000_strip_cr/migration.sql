-- Patch-54: strip Windows carriage returns (CHR(13)) that entered
-- Course.details via a CRLF-converted migration file on Windows.
-- The renderers are also hardened; this cleans the stored data.
-- Idempotent: guarded WHERE clauses no-op once clean.

UPDATE "Course"
SET "details" = REPLACE("details", CHR(13), ''), "updatedAt" = NOW()
WHERE "details" LIKE '%' || CHR(13) || '%';

UPDATE "Course"
SET "overview" = REPLACE("overview", CHR(13), ''), "updatedAt" = NOW()
WHERE "overview" LIKE '%' || CHR(13) || '%';
