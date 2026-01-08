-- AlterTable
ALTER TABLE "story" ADD COLUMN     "attached_files" JSONB,
ADD COLUMN     "final_user_story" JSONB,
ADD COLUMN     "idea" TEXT,
ADD COLUMN     "reference_links" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "user_requirements" TEXT;

-- Rename ai_output_json to generated_user_story and convert TEXT to JSONB
ALTER TABLE "story" RENAME COLUMN "ai_output_json" TO "generated_user_story";
ALTER TABLE "story" ALTER COLUMN "generated_user_story" TYPE JSONB USING "generated_user_story"::JSONB;
