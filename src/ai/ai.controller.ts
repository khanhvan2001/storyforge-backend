import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateDto } from '../dto/ai.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI content' })
  @ApiBody({ type: GenerateDto })
  @ApiResponse({ status: 200, description: 'AI content generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async generate(@Body() body: GenerateDto) {
    return this.aiService.generate(body.raw_input);
  }
}
