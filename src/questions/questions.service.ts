import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Prisma } from '@prisma/client';
import { PaginationResultDto } from '../commom/pagination/pagination-result.dto';
import { QuestionEntity } from './entities/question.entity';
import { QuestionPaginationDto } from './dto/question.pagination';

@Injectable()
export class QuestionService {
  constructor(private prismaService: PrismaService) {}

  includeFields = {
    answers: true,
  } satisfies Prisma.QuestionInclude;

  async create(createQuestionDto: CreateQuestionDto, user_id: string) {
    return this.prismaService.question.create({
      data: {
        ...createQuestionDto,
        created_by_user_id: user_id,
      },
      include: this.includeFields,
    });
  }

  async findAll(
    pagination: QuestionPaginationDto,
  ): Promise<PaginationResultDto<QuestionEntity>> {
    const results: QuestionEntity[] =
      await this.prismaService.question.findMany({
        include: this.includeFields,
        ...pagination.where(),
        ...pagination.sortBy(),
      });

    const total = await this.prismaService.question.count(pagination.where());
    return pagination.createMetadata(results, total);
  }

  findOne(id: string) {
    return this.prismaService.question.findUnique({
      where: { id },
      include: this.includeFields,
    });
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return this.prismaService.question.update({
      where: { id },
      data: updateQuestionDto,
      include: this.includeFields,
    });
  }

  remove(id: string) {
    return this.prismaService.question.delete({ where: { id } });
  }
}
