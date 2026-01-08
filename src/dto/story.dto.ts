import { ApiProperty } from '@nestjs/swagger';
import { GeneratedUserStoryDto } from './story-response.dto';

export class UpdateStoryDto {
  @ApiProperty({ 
    description: 'Story title', 
    required: false,
    example: 'User Login Feature'
  })
  title?: string;

  @ApiProperty({ 
    description: 'Story status', 
    required: false,
    example: 'completed'
  })
  status?: string;

  @ApiProperty({
    description: 'Story idea',
    required: false,
    example: 'User wants to implement a login feature',
  })
  idea?: string;

  @ApiProperty({
    description: 'User requirements',
    required: false,
    example: 'Must support email and username login, password reset functionality',
  })
  userRequirements?: string;

  @ApiProperty({
    description: 'Final user story (editable by user, cannot update generatedUserStory)',
    type: GeneratedUserStoryDto,
    required: false,
    example: {
      userStory: 'As a user, I want to log in to the system so that I can access my account.',
      acceptanceCriteria: [
        'Given a user is on the login page, When they enter valid credentials, Then they are redirected to the dashboard',
        'Given a user enters invalid credentials, When they submit the form, Then an error message is displayed',
      ],
      notes: 'Consider implementing 2FA in future iterations',
    },
  })
  finalUserStory?: GeneratedUserStoryDto;
}
