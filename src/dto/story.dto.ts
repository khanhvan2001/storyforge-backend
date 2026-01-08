import { ApiProperty } from '@nestjs/swagger';
import { AiOutputJsonDto } from './ai-response.dto';

export class CreateStoryDto {
  @ApiProperty({ description: 'Story title' })
  title: string;

  @ApiProperty({ description: 'Raw input text' })
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
  aiOutputJson: string | object | AiOutputJsonDto;

  @ApiProperty({ description: 'Story status' })
  status: string;
}

export class UpdateStoryDto {
  @ApiProperty({ description: 'Story title', required: false })
  title?: string;

  @ApiProperty({ description: 'Raw input text', required: false })
  rawInput?: string;

  @ApiProperty({
    description: 'AI output in JSON format',
    type: AiOutputJsonDto,
    required: false,
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
  aiOutputJson?: string | object | AiOutputJsonDto;

  @ApiProperty({ description: 'Story status', required: false })
  status?: string;
}

