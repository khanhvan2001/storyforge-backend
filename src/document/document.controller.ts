import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { CreateDocumentDto, UpdateDocumentDto } from '../dto/document.dto';
import { DocumentResponseDto } from '../dto/document-response.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // ================= CREATE =================
  @Post()
  @ApiOperation({
    summary: 'Create a new document',
    description: 'Create a new document with optional file attachments (PDF, DOCX, TXT, MD). Files are uploaded to S3-compatible storage (Filebase). Maximum 10 files per document.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'storyId'],
      properties: {
        title: {
          type: 'string',
          description: 'Document title',
          example: 'Project Requirements Document'
        },
        contentText: {
          type: 'string',
          nullable: true,
          description: 'Document content text (optional)',
          example: 'This document outlines the functional and non-functional requirements for the e-commerce platform project.'
        },
        storyId: {
          type: 'number',
          description: 'ID of the story this document belongs to',
          example: 1
        },
        files: {
          type: 'array',
          description: 'Optional file attachments (max 10 files). Supported types: .txt, .md, .pdf, .docx',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Story not found' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]),
  )
  create(
    @Request() req,
    @Body() body: CreateDocumentDto,
    @UploadedFiles()
    files?: {
      files?: Express.Multer.File[];
    },
  ) {
    return this.documentService.create(
      Number(req.user.userId),
      body,
      files?.files || [],
    );
  }

  // ================= FIND ALL =================
  @Get()
  @ApiOperation({
    summary: 'Get all documents for the current user',
    description: 'Retrieve all documents that belong to stories owned by the authenticated user. Includes attached files information.'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all documents with their attached files',
    type: [DocumentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.documentService.findAll(Number(req.user.userId));
  }

  // ================= FIND ONE =================
  @Get(':id')
  @ApiOperation({
    summary: 'Get a document by ID',
    description: 'Retrieve a specific document by its ID. User must own the story that this document belongs to.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Document ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the document with attached files information',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found or user does not have access' })
  findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentService.findOne(Number(req.user.userId), id);
  }

  // ================= UPDATE =================
  @Put(':id')
  @ApiOperation({
    summary: 'Update a document',
    description: 'Update document title, content, or add new file attachments. New files will be appended to existing attachedFiles array. Maximum 10 files per upload.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Document ID',
    example: 1
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          nullable: true,
          description: 'Updated document title (optional)',
          example: 'Updated Project Requirements Document'
        },
        contentText: {
          type: 'string',
          nullable: true,
          description: 'Updated document content text (optional)',
          example: 'Updated content with additional requirements for mobile responsiveness and API rate limiting.'
        },
        files: {
          type: 'array',
          description: 'Additional file attachments to append (optional, max 10 files). Supported types: .txt, .md, .pdf, .docx',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully. New files are appended to existing attachedFiles.',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found or user does not have access' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]),
  )
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDocumentDto,
    @UploadedFiles()
    files?: {
      files?: Express.Multer.File[];
    },
  ) {
    return this.documentService.update(
      Number(req.user.userId),
      id,
      body,
      files?.files || [],
    );
  }

  // ================= DELETE =================
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a document',
    description: 'Delete a document by ID. Note: Attached files in Filebase storage are NOT deleted to prevent accidental data loss.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Document ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully. Attached files remain in storage.'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found or user does not have access' })
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentService.remove(Number(req.user.userId), id);
  }
}
