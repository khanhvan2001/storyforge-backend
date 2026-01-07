import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class StoryService {
  private transformStory(story: any) {
    if (!story) return story;
    let aiOutputJson = story.ai_output_json;
    
    if (typeof aiOutputJson === 'string' && aiOutputJson.trim()) {
      try {
        aiOutputJson = JSON.parse(aiOutputJson);
      } catch (error) {
        // If parsing fails, keep as string
        console.warn('Failed to parse ai_output_json:', error);
      }
    }
    
    return {
      ...story,
      ai_output_json: aiOutputJson,
    };
  }

  async create(userId: number, data: { title: string; raw_input: string; ai_output_json: string | object; status: string }) {
    const story = await prisma.story.create({
      data: {
        ...data,
        ai_output_json: typeof data.ai_output_json === 'string' ? data.ai_output_json : JSON.stringify(data.ai_output_json),
        user_id: userId,
      },
    });
    return this.transformStory(story);
  }

  async findAll(userId: number) {
    const stories = await prisma.story.findMany({
      where: { user_id: userId },
    });
    return stories.map(story => this.transformStory(story));
  }

  async findOne(userId: number, id: number) {
    const story = await prisma.story.findFirst({
      where: { id, user_id: userId },
    });
    return this.transformStory(story);
  }

  async update(userId: number, id: number, data: { title?: string; raw_input?: string; ai_output_json?: string | object; status?: string }) {
    const updateData: any = { ...data };
    if (data.ai_output_json !== undefined) {
      updateData.ai_output_json = typeof data.ai_output_json === 'string' ? data.ai_output_json : JSON.stringify(data.ai_output_json);
    }
    await prisma.story.updateMany({
      where: { id, user_id: userId },
      data: updateData,
    });
    // Return the updated story with transformed ai_output_json
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number) {
    return prisma.story.deleteMany({
      where: { id, user_id: userId },
    });
  }
}
