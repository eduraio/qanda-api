import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Prisma } from '@prisma/client';
import { PaginationResultDto } from '../commom/pagination/pagination-result.dto';
import { AnswerEntity } from './entities/answer.entity';
import { AnswerPaginationDto } from './dto/answer.pagination';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AnswersService {
  constructor(private prismaService: PrismaService) {}

  #includeFields = {
    question: true,
    answer_by_user: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    },
  } satisfies Prisma.AnswerInclude;

  async create(
    createAnswerDto: CreateAnswerDto,
    authenticated_user_id: string,
  ) {
    const question = await this.prismaService.question.findUnique({
      where: {
        id: createAnswerDto.question_id,
      },
    });

    if (question.created_by_user_id === authenticated_user_id)
      throw new HttpException(
        'User cannot answer their own question',
        HttpStatus.BAD_REQUEST,
      );

    const questionsAnswerByUserExists =
      await this.prismaService.answer.findUnique({
        where: {
          question_id_answer_by_user_id: {
            answer_by_user_id: authenticated_user_id,
            question_id: createAnswerDto.question_id,
          },
        },
      });

    if (questionsAnswerByUserExists)
      throw new HttpException(
        'User can only answer the question once',
        HttpStatus.CONFLICT,
      );

    return this.prismaService.answer.create({
      data: {
        ...createAnswerDto,
        answer_by_user_id: authenticated_user_id,
      },
      include: this.#includeFields,
    });
  }

  async findAll(
    pagination: AnswerPaginationDto,
    authenticated_user: UserEntity,
  ): Promise<PaginationResultDto<AnswerEntity>> {
    const where = {
      ...pagination.where().where,
      answer_by_user_id:
        authenticated_user.role === 'PARTICIPANT'
          ? authenticated_user.id
          : undefined,
    };
    const results: AnswerEntity[] = await this.prismaService.answer.findMany({
      include: this.#includeFields,
      where,
      ...pagination.sortBy(),
    });

    const total = await this.prismaService.answer.count({ where });
    return pagination.createMetadata(results, total);
  }

  async findOne(id: string, authenticated_user: UserEntity) {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
    });

    if (
      authenticated_user.role === 'PARTICIPANT' &&
      answer.answer_by_user_id !== authenticated_user.id
    )
      throw new HttpException(
        'User can update only their own answers',
        HttpStatus.UNAUTHORIZED,
      );

    return this.prismaService.answer.findUnique({
      where: { id },
      include: this.#includeFields,
    });
  }

  async update(
    id: string,
    answerAnswerDto: UpdateAnswerDto,
    authenticated_user_id: string,
  ) {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
    });

    if (!answer) throw new NotFoundException(`Answer Not Found (${id})`);

    if (answer.answer_by_user_id !== authenticated_user_id)
      throw new HttpException(
        'User can update only their own answers',
        HttpStatus.UNAUTHORIZED,
      );
    return this.prismaService.answer.update({
      where: { id },
      data: answerAnswerDto,
      include: this.#includeFields,
    });
  }

  async remove(id: string, authenticated_user_id: string) {
    const answer = await this.prismaService.answer.findUnique({
      where: { id },
    });

    if (answer.answer_by_user_id !== authenticated_user_id)
      throw new HttpException(
        'User can delete only their own answers',
        HttpStatus.UNAUTHORIZED,
      );

    return this.prismaService.answer.delete({ where: { id } });
  }
}
