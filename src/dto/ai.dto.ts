import { ApiProperty } from '@nestjs/swagger';

export class GenerateDto {
  @ApiProperty({ description: 'Raw input text for AI generation' })
  raw_input: string;
}

