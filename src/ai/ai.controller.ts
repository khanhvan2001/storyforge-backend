import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateDto } from '../dto/ai.dto';
import { GenerateResponseDto } from '../dto/ai-response.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI content' })
  @ApiBody({ type: GenerateDto })
  @ApiResponse({
    status: 200,
    description: 'AI content generated successfully',
    type: GenerateResponseDto,
    example: {
      title: 'User Login Feature',
      user_story: 'As a user, I want to log in to the system so that I can access my account.',
      acceptance_criteria: [
        'User can enter username and password',
        'System validates credentials',
        'User is redirected to dashboard upon successful login',
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async generate(@Body() body: GenerateDto) {
    return this.aiService.generate(body.raw_input);
  }
}
