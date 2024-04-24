import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Prisma } from '@prisma/client';
import { PaginationResultDto } from '../commom/pagination/pagination-result.dto';
import { AnswerEntity } from './entities/answer.entity';
import { AnswerPaginationDto } from './dto/answer.pagination';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private prismaService: PrismaService) {}

  includeFields = {
    question: true,
    answer_by_user: true,
  } satisfies Prisma.AnswerInclude;

  async create(createAnswerDto: CreateAnswerDto, user_id: string) {
    const question = await this.prismaService.question.findUnique({
      where: {
        id: createAnswerDto.question_id,
      },
    });

    if (question.created_by_user_id === user_id)
      throw new HttpException(
        'User cannot answer their own question',
        HttpStatus.BAD_REQUEST,
      );

    return this.prismaService.answer.create({
      data: {
        ...createAnswerDto,
        answer_by_user_id: user_id,
      },
      include: this.includeFields,
    });
  }

  async findAll(
    pagination: AnswerPaginationDto,
  ): Promise<PaginationResultDto<AnswerEntity>> {
    const results: AnswerEntity[] = await this.prismaService.answer.findMany({
      include: this.includeFields,
      ...pagination.where(),
      ...pagination.sortBy(),
    });

    const total = await this.prismaService.answer.count(pagination.where());
    return pagination.createMetadata(results, total);
  }

  findOne(id: string) {
    return this.prismaService.answer.findUnique({
      where: { id },
      include: this.includeFields,
    });
  }

  async update(id: string, answerAnswerDto: UpdateAnswerDto) {
    return this.prismaService.answer.update({
      where: { id },
      data: answerAnswerDto,
      include: this.includeFields,
    });
  }

  remove(id: string) {
    return this.prismaService.answer.delete({ where: { id } });
  }
}
