import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

export enum QuestionSortEnum {
  CreatedAt = 'created_at',
}

export class QuestionPaginationDto extends PaginationQueryDto<QuestionSortEnum> {
  @ApiPropertyOptional({
    enum: QuestionSortEnum,
    default: QuestionSortEnum.CreatedAt,
  })
  @IsEnum(QuestionSortEnum)
  @IsOptional()
  sort: QuestionSortEnum = QuestionSortEnum.CreatedAt;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  created_by_user_id?: string;

  where(): { where: Prisma.QuestionWhereInput } {
    const AND: Prisma.QuestionWhereInput[] = [];

    AND.push(super.where()?.where ?? {});

    if (this.id) {
      AND.push({
        id: this.id,
      });
    }

    if (this.question) {
      AND.push({
        question: {
          contains: this.question,
          mode: 'insensitive',
        },
      });
    }

    if (this.created_by_user_id) {
      AND.push({
        created_by_user_id: this.created_by_user_id,
      });
    }

    return { where: { AND } };
  }
}
