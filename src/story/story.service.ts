import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { FileExtractionService } from './file-extraction.service';
import { LinkExtractionService } from './link-extraction.service';

const prisma = new PrismaClient();

@Injectable()
export class StoryService {
  constructor(
    private aiService: AiService,
    private fileExtractionService: FileExtractionService,
    private linkExtractionService: LinkExtractionService,
  ) {}
  async findAll(userId: number) {
    const stories = await prisma.story.findMany({
      where: { userId: userId },
    });
    return stories;
  }

  async findOne(userId: number, id: number) {
    const story = await prisma.story.findFirst({
      where: { id, userId: userId },
    });
    return story;
  }

  async update(userId: number, id: number, data: { title?: string; status?: string; idea?: string; userRequirements?: string; finalUserStory?: any }) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.idea !== undefined) updateData.idea = data.idea;
    if (data.userRequirements !== undefined) updateData.userRequirements = data.userRequirements;
    if (data.finalUserStory !== undefined) {
      updateData.finalUserStory = typeof data.finalUserStory === 'string' ? JSON.parse(data.finalUserStory) : data.finalUserStory;
    }
    
    await prisma.story.updateMany({
      where: { id, userId: userId },
      data: updateData,
    });
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number) {
    return prisma.story.deleteMany({
      where: { id, userId: userId },
    });
  }

  async generate(
    userId: number,
    idea: string,
    userRequirements: string,
    files?: Express.Multer.File[],
    referenceLinks?: string[],
  ) {
    // Extract text from files
    let attachedContent = '';
    const attachedFilesMetadata: any[] = [];

    if (files && files.length > 0) {
      const extractedTexts: string[] = [];
      for (const file of files) {
        try {
          const text = await this.fileExtractionService.extractText(file);
          extractedTexts.push(text);
          attachedFilesMetadata.push({
            name: file.originalname,
            size: file.size,
            snippet: text.substring(0, 200),
          });
        } catch (error) {
          console.error(`Failed to extract text from ${file.originalname}:`, error);
        }
      }
      attachedContent = extractedTexts.join('\n\n');
      attachedContent = this.fileExtractionService.truncateContent(attachedContent, 20000);
    }

    // Extract text from links
    let referenceContent = '';
    if (referenceLinks && referenceLinks.length > 0) {
      referenceContent = await this.linkExtractionService.extractTextFromLinks(referenceLinks);
    }

    // Generate user story using AI
    const generatedUserStory = await this.aiService.generateUserStory(
      idea,
      userRequirements,
      attachedContent,
      referenceContent,
    );

    // Create story in database
    const story = await prisma.story.create({
      data: {
        title: `Story: ${idea.substring(0, 50)}`,
        rawInput: `${idea}\n\n${userRequirements}`,
        generatedUserStory: generatedUserStory,
        finalUserStory: generatedUserStory,
        status: 'generated',
        userId: userId,
        idea: idea,
        userRequirements: userRequirements,
        attachedFiles: attachedFilesMetadata.length > 0 ? attachedFilesMetadata : undefined,
        referenceLinks: referenceLinks || [],
      },
    });

    return story;
  }
}
