import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class StoryService {
  private transformAiOutputJson(aiOutputJson: string | object): object {
    if (typeof aiOutputJson === 'string' && aiOutputJson.trim()) {
      try {
        return JSON.parse(aiOutputJson);
      } catch (error) {
        console.warn('Failed to parse aiOutputJson:', error);
        return {};
      }
    }
    return typeof aiOutputJson === 'object' ? aiOutputJson : {};
  }

  async create(userId: number, data: { title: string; rawInput: string; aiOutputJson: string | object; status: string }) {
    const story = await prisma.story.create({
      data: {
        title: data.title,
        rawInput: data.rawInput,
        aiOutputJson: typeof data.aiOutputJson === 'string' ? data.aiOutputJson : JSON.stringify(data.aiOutputJson),
        status: data.status,
        userId: userId,
      },
    });
    return {
      ...story,
      aiOutputJson: this.transformAiOutputJson(story.aiOutputJson),
    };
  }

  async findAll(userId: number) {
    const stories = await prisma.story.findMany({
      where: { userId: userId },
    });
    return stories.map(story => ({
      ...story,
      aiOutputJson: this.transformAiOutputJson(story.aiOutputJson),
    }));
  }

  async findOne(userId: number, id: number) {
    const story = await prisma.story.findFirst({
      where: { id, userId: userId },
    });
    if (!story) return null;
    return {
      ...story,
      aiOutputJson: this.transformAiOutputJson(story.aiOutputJson),
    };
  }

  async update(userId: number, id: number, data: { title?: string; rawInput?: string; aiOutputJson?: string | object; status?: string }) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.rawInput !== undefined) updateData.rawInput = data.rawInput;
    if (data.aiOutputJson !== undefined) {
      updateData.aiOutputJson = typeof data.aiOutputJson === 'string' ? data.aiOutputJson : JSON.stringify(data.aiOutputJson);
    }
    if (data.status !== undefined) updateData.status = data.status;
    
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
}
