import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { AiService } from '../ai/ai.service';
import { FileExtractionService } from './file-extraction.service';
import { LinkExtractionService } from './link-extraction.service';
import { filebaseClient } from '../document/filebase.client';

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
      orderBy: { createdAt: 'desc' },
    });
    return stories;
  }

  async findOne(userId: number, id: number) {
    const story = await prisma.story.findFirst({
      where: { id, userId: userId },
    });
    return story;
  }

  async update(
    userId: number,
    id: number,
    data: {
      title?: string;
      status?: string;
      idea?: string;
      userRequirements?: string;
      finalUserStory?: any;
    },
  ) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.idea !== undefined) updateData.idea = data.idea;
    if (data.userRequirements !== undefined)
      updateData.userRequirements = data.userRequirements;
    if (data.finalUserStory !== undefined) {
      updateData.finalUserStory =
        typeof data.finalUserStory === 'string'
          ? JSON.parse(data.finalUserStory)
          : data.finalUserStory;
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
          console.error(
            `Failed to extract text from ${file.originalname}:`,
            error,
          );
        }
      }
      attachedContent = extractedTexts.join('\n\n');
      attachedContent = this.fileExtractionService.truncateContent(
        attachedContent,
        20000,
      );
    }

    // Extract text from links
    let referenceContent = '';
    if (referenceLinks && referenceLinks.length > 0) {
      referenceContent =
        await this.linkExtractionService.extractTextFromLinks(referenceLinks);
    }

    // Generate user story using AI
    const generatedUserStory = await this.aiService.generateUserStory(
      idea,
      userRequirements,
      attachedContent,
      referenceContent,
    );

    return prisma.$transaction(async (tx) => {
      // Create story first to get storyId
      const story = await tx.story.create({
        data: {
          title: `Story: ${idea.substring(0, 50)}`,
          rawInput: `${idea}\n\n${userRequirements}`,
          generatedUserStory: generatedUserStory,
          finalUserStory: generatedUserStory,
          status: 'generated',
          userId: userId,
          idea: idea,
          userRequirements: userRequirements,
          attachedFiles:
            attachedFilesMetadata.length > 0
              ? attachedFilesMetadata
              : undefined,
          referenceLinks: referenceLinks || [],
        },
      });

      // Upload files to Filebase and merge with existing metadata
      if (files && files.length > 0) {
        const fileKeys: string[] = [];
        const updatedFilesMetadata = attachedFilesMetadata.map(
          (metadata, index) => {
            const file = files[index];
            const fileKey = `stories/${story.id}/${randomUUID()}-${file.originalname}`;
            fileKeys.push(fileKey);
            const fileUrl = `${process.env.FILEBASE_ENDPOINT}/${process.env.FILEBASE_BUCKET}/${fileKey}`;

            return {
              name: file.originalname,
              size: file.size,
              snippet: metadata.snippet,
              url: fileUrl,
            };
          },
        );

        // Upload files to Filebase
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileKey = fileKeys[i];

          await filebaseClient.send(
            new PutObjectCommand({
              Bucket: process.env.FILEBASE_BUCKET!,
              Key: fileKey,
              Body: file.buffer,
              ContentType: file.mimetype,
            }),
          );
        }

        // Update story with metadata (name, size, snippet, url only)
        return tx.story.update({
          where: { id: story.id },
          data: {
            attachedFiles: updatedFilesMetadata,
          },
        });
      }

      return story;
    });
  }

  async refine(
    userId: number,
    idea: string,
    userRequirements: string,
    files?: Express.Multer.File[],
    referenceLinks?: string[],
  ) {
    // 1. Extract text from files
    let attachedContent = '';
    if (files && files.length > 0) {
      const extractedTexts: string[] = [];
      for (const file of files) {
        try {
          const text = await this.fileExtractionService.extractText(file);
          if (text)
            extractedTexts.push(`--- File: ${file.originalname} ---\n${text}`);
        } catch (error) {
          console.error(
            `Failed to extract text from ${file.originalname}:`,
            error,
          );
        }
      }
      attachedContent = extractedTexts.join('\n\n');
    }

    // 2. Extract content from links
    let referenceContent = '';
    if (referenceLinks && referenceLinks.length > 0) {
      try {
        referenceContent = referenceContent =
          await this.linkExtractionService.extractTextFromLinks(referenceLinks);
      } catch (error) {
        console.error('Failed to extract links:', error);
      }
    }

    // 3. Call AI with context
    return this.aiService.generateClarifyingQuestions(
      idea,
      userRequirements,
      attachedContent,
      referenceContent,
    );
  }

  async editWithAi(userId: number, storyId: number, instruction: string) {
    const story = await this.findOne(userId, storyId);
    if (!story) {
      throw new Error('Story not found');
    }

    // Use finalUserStory if it exists, otherwise generatedUserStory
    const currentStory = story.finalUserStory || story.generatedUserStory;

    if (!currentStory) {
      throw new Error('No user story content to edit');
    }

    return this.aiService.editUserStory(currentStory, instruction);
  }
}
