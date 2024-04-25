import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../commom/pagination/pagination-query.dto';

export enum AnswerSortEnum {
  CreatedAt = 'created_at',
}

export class QuestionAnswersPaginationDto extends PaginationQueryDto<AnswerSortEnum> {
  @ApiPropertyOptional({
    enum: AnswerSortEnum,
    default: AnswerSortEnum.CreatedAt,
  })
  @IsEnum(AnswerSortEnum)
  @IsOptional()
  sort: AnswerSortEnum = AnswerSortEnum.CreatedAt;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  answer_by_user_id?: string;

  where(): { where: Prisma.AnswerWhereInput } {
    const AND: Prisma.AnswerWhereInput[] = [];

    AND.push(super.where()?.where ?? {});

    if (this.answer) {
      AND.push({
        answer: {
          contains: this.answer,
          mode: 'insensitive',
        },
      });
    }

    if (this.answer_by_user_id) {
      AND.push({
        answer_by_user_id: this.answer_by_user_id,
      });
    }

    return { where: { AND } };
  }
}
