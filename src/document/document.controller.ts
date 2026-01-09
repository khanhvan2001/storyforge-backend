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
  @ApiOperation({ summary: 'Create a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'storyId'],
      properties: {
        title: { type: 'string' },
        contentText: { type: 'string', nullable: true },
        storyId: { type: 'number' },
        files: {
          type: 'array',
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
  @ApiOperation({ summary: 'Get all documents for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all documents',
    type: [DocumentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.documentService.findAll(Number(req.user.userId));
  }

  // ================= FIND ONE =================
  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the document',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentService.findOne(Number(req.user.userId), id);
  }

  // ================= UPDATE =================
  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: 'number', description: 'Document ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', nullable: true },
        contentText: { type: 'string', nullable: true },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
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
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', type: 'number', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentService.remove(Number(req.user.userId), id);
  }
}
