import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty({
    enum: UserRoles,
    example: Object.keys(UserRoles).join(' | '),
  })
  role: UserRoles;
}
