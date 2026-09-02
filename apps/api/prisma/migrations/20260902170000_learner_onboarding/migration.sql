-- patch-46: learner onboarding completion marker
ALTER TABLE "LmsUser" ADD COLUMN "onboardedAt" TIMESTAMP(3);
