import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Prisma } from '@prisma/client';
import { PaginationResultDto } from '../common/pagination/pagination-result.dto';
import { QuestionPaginationDto } from './dto/question.pagination';
import { QuestionAnswersPaginationDto } from './dto/question-answers.pagination';
import { AnswerEntity } from '../answers/entities/answer.entity';
import { QuestionEntity } from './entities/question.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private prismaService: PrismaService) {}

  #includeFields = {
    answers: true,
  } satisfies Prisma.QuestionInclude;

  async create(
    createQuestionDto: CreateQuestionDto,
    authenticated_user_id: string,
  ) {
    return this.prismaService.question.create({
      data: {
        ...createQuestionDto,
        created_by_user_id: authenticated_user_id,
      },
      include: this.#includeFields,
    });
  }

  async findAll(
    pagination: QuestionPaginationDto,
    authenticated_user_id: string,
  ): Promise<PaginationResultDto<QuestionEntity>> {
    const results = await this.prismaService.question.findMany({
      include: this.#includeFields,
      ...pagination.where(),
      ...pagination.sortBy(),
    });

    const resultsWithAnsweredFlag = results.map((result) => {
      return {
        ...result,
        answered_by_me: result.answers
          ? result.answers.some(
              (answer) => answer.answer_by_user_id === authenticated_user_id,
            )
          : false,
        answers: undefined,
      };
    });

    const total = await this.prismaService.question.count(pagination.where());
    return pagination.createMetadata(resultsWithAnsweredFlag, total);
  }

  async findOne(id: string, authenticated_user_id: string) {
    const question = await this.prismaService.question.findUnique({
      where: { id },
      include: this.#includeFields,
    });

    if (!question) return;

    return {
      ...question,
      answered_by_me: question.answers.some(
        (answer) => answer.answer_by_user_id === authenticated_user_id,
      ),
    };
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    authenticated_user_id: string,
  ) {
    const question = await this.prismaService.question.findUnique({
      where: { id },
    });

    if (question.created_by_user_id !== authenticated_user_id)
      throw new HttpException(
        'User can update only their own questions',
        HttpStatus.UNAUTHORIZED,
      );

    return this.prismaService.question.update({
      where: { id },
      data: updateQuestionDto,
      include: this.#includeFields,
    });
  }

  async remove(id: string, authenticated_user_id: string) {
    const question = await this.prismaService.question.findUnique({
      where: { id },
    });

    if (question && question.created_by_user_id !== authenticated_user_id)
      throw new HttpException(
        'User can delete only their own questions',
        HttpStatus.UNAUTHORIZED,
      );
    return this.prismaService.question.delete({ where: { id } });
  }

  async findAnswersByQuestionId(
    question_id: string,
    pagination: QuestionAnswersPaginationDto,
  ): Promise<PaginationResultDto<AnswerEntity>> {
    const where = pagination.where()
      ? {
          ...pagination.where().where,
          question_id,
        }
      : undefined;
    const results = await this.prismaService.answer.findMany({
      where,
      ...pagination.sortBy(),
    });

    const total = await this.prismaService.answer.count({ where });
    return pagination.createMetadata(results, total);
  }
}
