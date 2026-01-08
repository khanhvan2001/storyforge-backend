import { ApiProperty } from '@nestjs/swagger';

export class AiOutputJsonDto {
  @ApiProperty({
    description: 'Story title',
    example: 'User Login Feature',
  })
  title: string;

  @ApiProperty({
    description: 'User story description',
    example: 'As a user, I want to log in to the system so that I can access my account.',
  })
  userStory: string;

  @ApiProperty({
    description: 'Acceptance criteria',
    example: [
      'User can enter username and password',
      'System validates credentials',
      'User is redirected to dashboard upon successful login',
    ],
    type: [String],
  })
  acceptanceCriteria: string[];
}

// Alias for backward compatibility
export class GenerateResponseDto extends AiOutputJsonDto {}

