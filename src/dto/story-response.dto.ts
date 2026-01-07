import { ApiProperty } from '@nestjs/swagger';
import { AiOutputJsonDto } from './ai-response.dto';

export class StoryResponseDto {
  @ApiProperty({ description: 'Story ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Story title', example: 'User Login Feature' })
  title: string;

  @ApiProperty({ description: 'Raw input text', example: 'User wants to login' })
  raw_input: string;

  @ApiProperty({
    description: 'AI output in JSON format',
    type: AiOutputJsonDto,
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
  ai_output_json: AiOutputJsonDto;

  @ApiProperty({ description: 'Story status', example: 'draft' })
  status: string;

  @ApiProperty({ description: 'User ID', example: 1 })
  user_id: number;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updated_at: Date;
}

