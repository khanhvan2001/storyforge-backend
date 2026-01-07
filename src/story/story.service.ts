import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class StoryService {
  async create(userId: number, data: { title: string; raw_input: string; ai_output_json: string | object; status: string }) {
    return prisma.story.create({
      data: {
        ...data,
        ai_output_json: typeof data.ai_output_json === 'string' ? data.ai_output_json : JSON.stringify(data.ai_output_json),
        user_id: userId,
      },
    });
  }

  async findAll(userId: number) {
    return prisma.story.findMany({
      where: { user_id: userId },
    });
  }

  async findOne(userId: number, id: number) {
    return prisma.story.findFirst({
      where: { id, user_id: userId },
    });
  }

  async update(userId: number, id: number, data: { title?: string; raw_input?: string; ai_output_json?: string | object; status?: string }) {
    const updateData: any = { ...data };
    if (data.ai_output_json !== undefined) {
      updateData.ai_output_json = typeof data.ai_output_json === 'string' ? data.ai_output_json : JSON.stringify(data.ai_output_json);
    }
    return prisma.story.updateMany({
      where: { id, user_id: userId },
      data: updateData,
    });
  }

  async remove(userId: number, id: number) {
    return prisma.story.deleteMany({
      where: { id, user_id: userId },
    });
  }
}
