import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';

export class UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;

  @ApiProperty({
    enum: UserRoles,
    example: Object.keys(UserRoles).join(' | '),
  })
  role: UserRoles;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
