import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, UserRoles } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../commom/pagination/pagination-query.dto';

export enum UserSortEnum {
  CreatedAt = 'created_at',
}

export class UserPaginationDto extends PaginationQueryDto<UserSortEnum> {
  @ApiPropertyOptional({
    enum: UserSortEnum,
    default: UserSortEnum.CreatedAt,
  })
  @IsEnum(UserSortEnum)
  @IsOptional()
  sort: UserSortEnum = UserSortEnum.CreatedAt;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    enum: UserRoles,
  })
  @IsEnum(UserRoles)
  @IsOptional()
  role?: UserRoles;

  where(): { where: Prisma.UserWhereInput } {
    const AND: Prisma.UserWhereInput[] = [];

    AND.push(super.where()?.where ?? {});

    if (this.name) {
      AND.push({
        name: {
          contains: this.name,
          mode: 'insensitive',
        },
      });
    }

    if (this.email) {
      AND.push({ email: this.email });
    }

    if (this.role) {
      AND.push({ role: this.role });
    }

    return { where: { AND } };
  }
}
