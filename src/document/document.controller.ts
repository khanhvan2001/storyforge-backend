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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { CreateDocumentDto, UpdateDocumentDto } from '../dto/document.dto';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
    example: {
      id: 1,
      title: 'API Documentation',
      content_text: 'This document describes the API endpoints...',
      story_id: 1,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() body: CreateDocumentDto) {
    return this.documentService.create(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all documents',
    example: [
      {
        id: 1,
        title: 'API Documentation',
        content_text: 'This document describes the API endpoints...',
        story_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    ],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.documentService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the document',
    example: {
      id: 1,
      title: 'API Documentation',
      content_text: 'This document describes the API endpoints...',
      story_id: 1,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.documentService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiParam({ name: 'id', type: 'number', description: 'Document ID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateDocumentDto) {
    return this.documentService.update(req.user.userId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', type: 'number', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.documentService.remove(req.user.userId, id);
  }
}
