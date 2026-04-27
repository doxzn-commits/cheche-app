-- AlterTable: benefit, campaignType, pointAmount 컬럼 추가
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "benefit" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "campaignType" TEXT;
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "pointAmount" INTEGER;
