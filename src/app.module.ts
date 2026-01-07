import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { StoryModule } from './story/story.module';

@Module({
  imports: [AuthModule, StoryModule, DocumentModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
