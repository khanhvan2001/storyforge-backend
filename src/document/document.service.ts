import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { filebaseClient } from './filebase.client';

const prisma = new PrismaClient();

@Injectable()
export class DocumentService {
  // ================= CREATE =================
  async create(
    userId: number,
    data: { title: string; contentText?: string; storyId: number },
    files: Express.Multer.File[] = [],
  ) {
    // 1. Check story ownership
    const story = await prisma.story.findFirst({
      where: { id: Number(data.storyId), userId },
    });
    if (!story) {
      throw new Error('Story not found');
    }

    // 2. Upload files to Filebase (if any)
    let attachedFiles: any[] | undefined;

    if (files.length > 0) {
      attachedFiles = [];

      for (const file of files) {
        const fileKey = `documents/${data.storyId}/${randomUUID()}-${file.originalname}`;

        await filebaseClient.send(
          new PutObjectCommand({
            Bucket: process.env.FILEBASE_BUCKET!,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );

        const fileUrl = `${process.env.FILEBASE_ENDPOINT}/${process.env.FILEBASE_BUCKET}/${fileKey}`;

        attachedFiles.push({
          originalName: file.originalname,
          key: fileKey,
          url: fileUrl,
          size: file.size,
          mimeType: file.mimetype,
        });
      }
    }

    // 3. Create document
    return prisma.document.create({
      data: {
        title: String(data.title),
        contentText: data.contentText ?? null,
        storyId: Number(data.storyId),
        ...(attachedFiles && { attachedFiles }),
      },
    });
  }

  // ================= FIND =================
  async findAll(userId: number) {
    return prisma.document.findMany({
      where: {
        story: {
          userId,
        },
      },
    });
  }

  async findByStoryId(userId: number, storyId: number) {
    return prisma.document.findMany({
      where: {
        storyId,
        story: {
          userId,
        },
      },
    });
  }

  async findOne(userId: number, id: number) {
    return prisma.document.findFirst({
      where: {
        id,
        story: {
          userId,
        },
      },
    });
  }

  // ================= UPDATE =================
  async update(
    userId: number,
    id: number,
    data: { title?: string; contentText?: string },
    files: Express.Multer.File[] = [],
  ) {
    // 1. Check document ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
        story: {
          userId,
        },
      },
    });
    if (!document) {
      throw new Error('Document not found');
    }

    // 2. Upload new files (if any)
    let newAttachedFiles: any[] | undefined;

    if (files.length > 0) {
      newAttachedFiles = [];

      for (const file of files) {
        const fileKey = `documents/${document.storyId}/${randomUUID()}-${file.originalname}`;

        await filebaseClient.send(
          new PutObjectCommand({
            Bucket: process.env.FILEBASE_BUCKET!,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype
          }),
        );

        const fileUrl = `${process.env.FILEBASE_ENDPOINT}/${process.env.FILEBASE_BUCKET}/${fileKey}`;

        newAttachedFiles.push({
          originalName: file.originalname,
          key: fileKey,
          url: fileUrl,
          size: file.size,
          mimeType: file.mimetype,
        });
      }
    }

    // 3. Merge old + new files (MVP: append)
    const mergedAttachedFiles =
      newAttachedFiles && newAttachedFiles.length > 0
        ? [
            ...(Array.isArray(document.attachedFiles)
              ? document.attachedFiles
              : []),
            ...newAttachedFiles,
          ]
        : undefined;

    // 4. Update document
    return prisma.document.update({
      where: { id },
      data: {
        title: data.title ?? document.title,
        contentText:
          data.contentText !== undefined
            ? data.contentText
            : document.contentText,
        ...(mergedAttachedFiles && { attachedFiles: mergedAttachedFiles }),
      },
    });
  }

  // ================= DELETE =================
  async remove(userId: number, id: number) {
    const document = await prisma.document.findFirst({
      where: {
        id,
        story: {
          userId,
        },
      },
    });
    if (!document) {
      throw new Error('Document not found');
    }

    // NOTE (MVP):
    // Không xoá file trên Filebase để tránh accidental delete
    // Sau này có thể loop document.attachedFiles để delete object

    return prisma.document.delete({
      where: { id },
    });
  }
}
