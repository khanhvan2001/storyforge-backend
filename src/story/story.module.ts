import { Module } from '@nestjs/common';
import { DocumentModule } from '../document/document.module';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';

@Module({
  imports: [DocumentModule],
  controllers: [StoryController],
  providers: [StoryService],
})
export class StoryModule {}
