import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Document title',
    example: 'Project Requirements Document'
  })
  title: string;

  @ApiProperty({
    description: 'Document content text',
    required: false,
    example: 'This document outlines the functional and non-functional requirements for the e-commerce platform project. Key features include user authentication, product catalog, shopping cart, and payment integration.'
  })
  contentText?: string;

  @ApiProperty({
    description: 'Story ID that this document belongs to',
    example: 1
  })
  storyId: number;
}

export class UpdateDocumentDto {
  @ApiProperty({
    description: 'Document title',
    required: false,
    example: 'Updated Project Requirements Document'
  })
  title?: string;

  @ApiProperty({
    description: 'Document content text',
    required: false,
    example: 'Updated content with additional requirements for mobile responsiveness and API rate limiting.'
  })
  contentText?: string;
}
