import { ApiProperty } from '@nestjs/swagger';

export class GeneratedUserStoryDto {
  @ApiProperty({
    description: 'User story description',
    example: 'As a user, I want to log in to the system so that I can access my account.',
  })
  userStory: string;

  @ApiProperty({
    description: 'Acceptance criteria in Gherkin format',
    example: [
      'Given a user is on the login page, When they enter valid credentials, Then they are redirected to the dashboard',
    ],
    type: [String],
  })
  acceptanceCriteria: string[];

  @ApiProperty({
    description: 'Additional notes',
    example: 'Consider implementing 2FA in future iterations',
    required: false,
  })
  notes?: string;
}

export class StoryResponseDto {
  @ApiProperty({ description: 'Story ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Story title', example: 'User Login Feature' })
  title: string;

  @ApiProperty({ description: 'Story status', example: 'generated' })
  status: string;

  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Story idea',
    example: 'User wants to implement a login feature',
    required: false,
  })
  idea?: string;

  @ApiProperty({
    description: 'User requirements',
    example: 'Must support email and username login, password reset functionality',
    required: false,
  })
  userRequirements?: string;

  @ApiProperty({
    description: 'Attached files metadata',
    example: [
      {
        name: 'requirements.pdf',
        size: 1024,
        snippet: 'This document describes the login requirements...',
      },
    ],
    required: false,
  })
  attachedFiles?: Array<{
    name: string;
    size: number;
    snippet: string;
  }>;

  @ApiProperty({
    description: 'Reference links',
    example: ['https://example.com/docs', 'https://example.com/api'],
    type: [String],
    required: false,
  })
  referenceLinks?: string[];

  @ApiProperty({
    description: 'Generated user story from AI (read-only, cannot be updated)',
    type: GeneratedUserStoryDto,
    required: false,
    example: {
      userStory: 'As a registered user, I want to log in to the system using my email and password so that I can access my personalized dashboard.',
      acceptanceCriteria: [
        'Given a user is on the login page, When they enter valid email and password, Then they are redirected to the dashboard',
        'Given a user enters invalid credentials, When they submit the form, Then an error message is displayed',
        'Given a user clicks "Forgot Password", When they enter their email, Then a password reset link is sent',
      ],
      notes: 'Consider implementing 2FA and social login in future iterations',
    },
  })
  generatedUserStory?: GeneratedUserStoryDto;

  @ApiProperty({
    description: 'Final user story (editable by user)',
    type: GeneratedUserStoryDto,
    required: false,
    example: {
      userStory: 'As a registered user, I want to log in to the system using my email and password so that I can access my personalized dashboard.',
      acceptanceCriteria: [
        'Given a user is on the login page, When they enter valid email and password, Then they are redirected to the dashboard',
        'Given a user enters invalid credentials, When they submit the form, Then an error message is displayed',
        'Given a user clicks "Forgot Password", When they enter their email, Then a password reset link is sent',
      ],
      notes: 'Consider implementing 2FA and social login in future iterations',
    },
  })
  finalUserStory?: GeneratedUserStoryDto;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
