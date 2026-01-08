import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({ description: 'Document ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Document title', example: 'API Documentation' })
  title: string;

  @ApiProperty({ description: 'Document content text', example: 'This document describes the API endpoints...' })
  contentText: string;

  @ApiProperty({ description: 'Story ID', example: 1 })
  storyId: number;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
