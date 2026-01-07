import { ApiProperty } from '@nestjs/swagger';

export class CreateStoryDto {
  @ApiProperty({ description: 'Story title' })
  title: string;

  @ApiProperty({ description: 'Raw input text' })
  raw_input: string;

  @ApiProperty({ description: 'AI output in JSON format' })
  ai_output_json: string | object;

  @ApiProperty({ description: 'Story status' })
  status: string;
}

export class UpdateStoryDto {
  @ApiProperty({ description: 'Story title', required: false })
  title?: string;

  @ApiProperty({ description: 'Raw input text', required: false })
  raw_input?: string;

  @ApiProperty({ description: 'AI output in JSON format', required: false })
  ai_output_json?: string | object;

  @ApiProperty({ description: 'Story status', required: false })
  status?: string;
}

