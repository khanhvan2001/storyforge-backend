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
import { DocumentService } from '../document/document.service';
import { StoryService } from './story.service';
import { CreateStoryDto, UpdateStoryDto } from '../dto/story.dto';
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

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  @ApiBody({ type: CreateStoryDto })
  @ApiResponse({
    status: 201,
    description: 'Story created successfully',
    type: StoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() body: CreateStoryDto) {
    return this.storyService.create(req.user.userId, body);
  }

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
}
