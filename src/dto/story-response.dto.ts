import { ApiProperty } from '@nestjs/swagger';
import { AiOutputJsonDto } from './ai-response.dto';

export class StoryResponseDto {
  @ApiProperty({ description: 'Story ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Story title', example: 'User Login Feature' })
  title: string;

  @ApiProperty({ description: 'Raw input text', example: 'User wants to login' })
  rawInput: string;

  @ApiProperty({
    description: 'AI output in JSON format',
    type: AiOutputJsonDto,
    example: {
      title: 'User Login Feature',
      userStory: 'As a user, I want to log in to the system so that I can access my account.',
      acceptanceCriteria: [
        'User can enter username and password',
        'System validates credentials',
        'User is redirected to dashboard upon successful login',
      ],
    },
  })
  aiOutputJson: AiOutputJsonDto;

  @ApiProperty({ description: 'Story status', example: 'draft' })
  status: string;

  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}


