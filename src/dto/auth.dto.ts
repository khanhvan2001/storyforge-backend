import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username for registration' })
  username: string;

  @ApiProperty({ description: 'Password for registration' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Username for login' })
  username: string;

  @ApiProperty({ description: 'Password for login' })
  password: string;
}

