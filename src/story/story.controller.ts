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
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from '../document/document.service';
import { StoryService } from './story.service';
import { UpdateStoryDto } from '../dto/story.dto';
import { StoryResponseDto } from '../dto/story-response.dto';
import { DocumentResponseDto } from '../dto/document-response.dto';

@ApiTags('stories')
@ApiBearerAuth('JWT-auth')
@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoryController {
  constructor(
    private storyService: StoryService,
    private documentService: DocumentService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all stories for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all stories',
    type: [StoryResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req) {
    return this.storyService.findAll(req.user.userId);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get all documents for a story' })
  @ApiParam({ name: 'id', type: 'number', description: 'Story ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all documents for the story',
    type: [DocumentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Story not found' })
  findDocuments(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.documentService.findByStoryId(req.user.userId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a story by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Story ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the story',
    type: StoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Story not found' })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.storyService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a story' })
  @ApiParam({ name: 'id', type: 'number', description: 'Story ID' })
  @ApiBody({ type: UpdateStoryDto })
  @ApiResponse({
    status: 200,
    description: 'Story updated successfully',
    type: StoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Story not found' })
  update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateStoryDto) {
    return this.storyService.update(req.user.userId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a story' })
  @ApiParam({ name: 'id', type: 'number', description: 'Story ID' })
  @ApiResponse({ status: 200, description: 'Story deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Story not found' })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.storyService.remove(req.user.userId, id);
  }

  @Post('generate')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: 'Generate a user story from idea, requirements, files, and links',
    description: 'Generate a user story using AI (Gemini) based on idea, user requirements, attached files, and reference links. Supports file types: .txt, .md, .pdf, .docx. Maximum 10 files, total content truncated to 20,000 characters.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idea: {
          type: 'string',
          description: 'Story idea (required)',
          example: 'User wants to implement a login feature',
        },
        userRequirements: {
          type: 'string',
          description: 'User requirements (required)',
          example: 'Must support email and username login, password reset functionality',
        },
        referenceLinks: {
          type: 'string',
          description: 'Comma-separated reference links (optional)',
          example: 'https://example.com/docs,https://example.com/api',
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload files - supported formats: .txt, .md, .pdf, .docx (optional, max 10 files)',
        },
      },
      required: ['idea', 'userRequirements'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User story generated successfully. Returns Story object with generatedUserStory (AI-generated, read-only) and finalUserStory (editable) fields containing user story, acceptance criteria, and notes.',
    type: StoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid file format or missing required fields' })
  async generate(
    @Request() req,
    @Body() body: { idea: string; userRequirements: string; referenceLinks?: string },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const referenceLinks = body.referenceLinks
      ? body.referenceLinks.split(',').map(link => link.trim()).filter(link => link.length > 0)
      : undefined;

    return this.storyService.generate(
      req.user.userId,
      body.idea,
      body.userRequirements,
      files,
      referenceLinks,
    );
  }
}
