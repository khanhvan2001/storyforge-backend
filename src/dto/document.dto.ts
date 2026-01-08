import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document title' })
  title: string;

  @ApiProperty({ description: 'Document content text' })
  contentText: string;

  @ApiProperty({ description: 'Story ID that this document belongs to' })
  storyId: number;
}

export class UpdateDocumentDto {
  @ApiProperty({ description: 'Document title', required: false })
  title?: string;

  @ApiProperty({ description: 'Document content text', required: false })
  contentText?: string;
}

