import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class DocumentService {
  async create(userId: number, data: { title: string; content_text: string; story_id: number }) {
    const story = await prisma.story.findFirst({
      where: { id: data.story_id, user_id: userId },
    });
    if (!story) {
      throw new Error('Story not found');
    }
    return prisma.document.create({
      data,
    });
  }

  async findAll(userId: number) {
    return prisma.document.findMany({
      where: {
        story: {
          user_id: userId,
        },
      },
    });
  }

  async findByStoryId(userId: number, storyId: number) {
    return prisma.document.findMany({
      where: {
        story_id: storyId,
        story: {
          user_id: userId,
        },
      },
    });
  }

  async findOne(userId: number, id: number) {
    return prisma.document.findFirst({
      where: {
        id,
        story: {
          user_id: userId,
        },
      },
    });
  }

  async update(userId: number, id: number, data: { title?: string; content_text?: string }) {
    const document = await prisma.document.findFirst({
      where: {
        id,
        story: {
          user_id: userId,
        },
      },
    });
    if (!document) {
      throw new Error('Document not found');
    }
    return prisma.document.update({
      where: { id },
      data,
    });
  }

  async remove(userId: number, id: number) {
    const document = await prisma.document.findFirst({
      where: {
        id,
        story: {
          user_id: userId,
        },
      },
    });
    if (!document) {
      throw new Error('Document not found');
    }
    return prisma.document.delete({
      where: { id },
    });
  }
}
