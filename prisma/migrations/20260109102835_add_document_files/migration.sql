-- AlterTable
ALTER TABLE "document" ADD COLUMN     "attached_files" JSONB,
ALTER COLUMN "content_text" DROP NOT NULL;

-- AlterTable
ALTER TABLE "story" ALTER COLUMN "generated_user_story" DROP NOT NULL;
