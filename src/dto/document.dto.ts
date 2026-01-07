import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document title' })
  title: string;

  @ApiProperty({ description: 'Document content text' })
  content_text: string;

  @ApiProperty({ description: 'Story ID that this document belongs to' })
  story_id: number;
}

export class UpdateDocumentDto {
  @ApiProperty({ description: 'Document title', required: false })
  title?: string;

  @ApiProperty({ description: 'Document content text', required: false })
  content_text?: string;
}

