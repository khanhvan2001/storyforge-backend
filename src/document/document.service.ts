import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class DocumentService {
  async create(userId: number, data: { title: string; contentText: string; storyId: number }) {
    const story = await prisma.story.findFirst({
      where: { id: data.storyId, userId: userId },
    });
    if (!story) {
      throw new Error('Story not found');
    }
    return prisma.document.create({
      data: {
        title: data.title,
        contentText: data.contentText,
        storyId: data.storyId,
      },
    });
  }

  async findAll(userId: number) {
    return prisma.document.findMany({
      where: {
        story: {
          userId: userId,
        },
      },
    });
  }

  async findByStoryId(userId: number, storyId: number) {
    return prisma.document.findMany({
      where: {
        storyId: storyId,
        story: {
          userId: userId,
        },
      },
    });
  }

  async findOne(userId: number, id: number) {
    return prisma.document.findFirst({
      where: {
        id,
        story: {
          userId: userId,
        },
      },
    });
  }

  async update(userId: number, id: number, data: { title?: string; contentText?: string }) {
    const document = await prisma.document.findFirst({
      where: {
        id,
        story: {
          userId: userId,
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
          userId: userId,
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
