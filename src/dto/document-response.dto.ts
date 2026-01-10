import { ApiProperty } from '@nestjs/swagger';

class AttachedFileDto {
  @ApiProperty({ description: 'Original file name', example: 'requirements.pdf' })
  originalName: string;

  @ApiProperty({ description: 'File key in storage', example: 'documents/1/abc123-requirements.pdf' })
  key: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://s3.filebase.com/storyforge-bucket/documents/1/abc123-requirements.pdf'
  })
  url: string;

  @ApiProperty({ description: 'File size in bytes', example: 245678 })
  size: number;

  @ApiProperty({ description: 'MIME type', example: 'application/pdf' })
  mimeType: string;
}

export class DocumentResponseDto {
  @ApiProperty({ description: 'Document ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Document title', example: 'Project Requirements Document' })
  title: string;

  @ApiProperty({
    description: 'Document content text',
    example: 'This document outlines the functional and non-functional requirements for the e-commerce platform project.',
    nullable: true
  })
  contentText: string;

  @ApiProperty({
    description: 'Attached files stored in S3-compatible storage',
    type: [AttachedFileDto],
    nullable: true,
    example: [
      {
        originalName: 'requirements.pdf',
        key: 'documents/1/550e8400-e29b-41d4-a716-446655440000-requirements.pdf',
        url: 'https://s3.filebase.com/storyforge-bucket/documents/1/550e8400-e29b-41d4-a716-446655440000-requirements.pdf',
        size: 245678,
        mimeType: 'application/pdf'
      },
      {
        originalName: 'user-flow.png',
        key: 'documents/1/660e8400-e29b-41d4-a716-446655440001-user-flow.png',
        url: 'https://s3.filebase.com/storyforge-bucket/documents/1/660e8400-e29b-41d4-a716-446655440001-user-flow.png',
        size: 89234,
        mimeType: 'image/png'
      }
    ]
  })
  attachedFiles?: AttachedFileDto[];

  @ApiProperty({ description: 'Story ID', example: 1 })
  storyId: number;

  @ApiProperty({ description: 'Created at', example: '2025-01-10T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-01-10T00:00:00.000Z' })
  updatedAt: Date;
}
