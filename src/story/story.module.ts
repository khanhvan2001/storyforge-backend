import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { AiModule } from '../ai/ai.module';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { FileExtractionService } from './file-extraction.service';
import { LinkExtractionService } from './link-extraction.service';

@Module({
  imports: [DocumentModule, AiModule],
  controllers: [StoryController],
  providers: [StoryService, FileExtractionService, LinkExtractionService],
})
export class StoryModule {}
