import { ApiProperty } from '@nestjs/swagger';

export class GenerateDto {
  @ApiProperty({ description: 'Raw input text for AI generation' })
  rawInput: string;
}

