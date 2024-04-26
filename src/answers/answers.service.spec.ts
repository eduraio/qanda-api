import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { QuestionEntity } from '../questions/entities/question.entity';
import { HttpException } from '@nestjs/common';
import { AnswerEntity } from './entities/answer.entity';
import { AnswerPaginationDto } from './dto/answer.pagination';
import { UserEntity } from '../users/entities/user.entity';
import { UpdateAnswerDto } from './dto/update-answer.dto';

const question_uuid = '5ed563bc-753c-4355-9c26-c837c7fa4997';
const answer_uuid = 'd9ee9412-c79f-489a-9b98-27e5c19e6199';
const answer_creator_uuid = 'd9ee9412-c79f-489a-9b98-27e5c19e6198';
const authenticated_user_id = '35a867e4-f09b-45cf-868e-cb48ae3dd6bf';
const question_creator_user_id = 'a44f4c0c-95f2-4cb2-b1d7-090fe02655f4';

describe('answersService', () => {
  let answersService: AnswersService;

  const authenticated_user: UserEntity = {
    id: authenticated_user_id,
    role: 'ORGANIZER',
    created_at: new Date(),
    updated_at: new Date(),
    email: 'email@email.com',
    name: 'name',
    password: 'pass',
  };

  const authenticated_participant_user: UserEntity = {
    id: authenticated_user_id,
    role: 'PARTICIPANT',
    created_at: new Date(),
    updated_at: new Date(),
    email: 'email@email.com',
    name: 'name',
    password: 'pass',
  };

  const mockPrismaService = {
    question: {
      findUnique: jest.fn(),
    },
    answer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    answersService = module.get<AnswersService>(AnswersService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('Should be defined', () => {
    expect(answersService).toBeDefined();
  });

  describe('Create', () => {
    it('User cannot answer their own question', async () => {
      const answerDto: CreateAnswerDto = {
        answer: 'answer',
        question_id: question_uuid,
      };

      const questionEntity: Partial<QuestionEntity> = {
        question: 'question',
        created_by_user_id: question_creator_user_id,
      };

      mockPrismaService.question.findUnique.mockReturnValueOnce(questionEntity);

      try {
        await answersService.create(answerDto, question_creator_user_id);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User cannot answer their own question');
      }

      expect(mockPrismaService.answer.create).toHaveBeenCalledTimes(0);
    });

    it('User can only answer the question once', async () => {
      const answerDto: CreateAnswerDto = {
        answer: 'answer',
        question_id: question_uuid,
      };

      const answerEntity: Partial<AnswerEntity> = {
        answer: 'answer',
        answer_by_user_id: authenticated_user_id,
        question_id: question_uuid,
      };

      mockPrismaService.answer.findUnique.mockReturnValueOnce(answerEntity);

      try {
        await answersService.create(answerDto, authenticated_user_id);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User can only answer the question once');
      }

      expect(mockPrismaService.answer.create).toHaveBeenCalledTimes(0);
    });

    it('Should Create', async () => {
      const answerDto: CreateAnswerDto = {
        answer: 'answer',
        question_id: question_uuid,
      };

      await answersService.create(answerDto, authenticated_user_id);

      expect(mockPrismaService.answer.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.answer.create).toHaveBeenCalledWith({
        data: {
          answer: answerDto.answer,
          question_id: answerDto.question_id,
          answer_by_user_id: authenticated_user_id,
        },
        include: {
          answer_by_user: {
            select: {
              created_at: true,
              email: true,
              id: true,
              name: true,
              role: true,
              updated_at: true,
            },
          },
          question: true,
        },
      });
    });
  });

  it('FindAll', async () => {
    const answerDto: CreateAnswerDto = {
      answer: 'answer',
      question_id: question_uuid,
    };

    const pagination = {
      where: () => {},
      sortBy: () => {},
      createMetadata: (sort: any, order: any, offset: any, limit: any) => {},
    } as AnswerPaginationDto;

    mockPrismaService.answer.findMany.mockReturnValueOnce([answerDto]);

    await answersService.findAll(pagination, authenticated_user);

    expect(mockPrismaService.answer.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.answer.findMany).toHaveBeenCalledWith({
      include: {
        answer_by_user: {
          select: {
            created_at: true,
            email: true,
            id: true,
            name: true,
            role: true,
            updated_at: true,
          },
        },
        question: true,
      },
    });
  });

  describe('FindOne', () => {
    it('User can get only their own answers', async () => {
      const answerEntity: Partial<AnswerEntity> = {
        answer: 'answer',
        answer_by_user_id: answer_creator_uuid,
        question_id: question_uuid,
      };

      mockPrismaService.answer.findUnique.mockReturnValueOnce(answerEntity);

      try {
        await answersService.findOne(
          answer_uuid,
          authenticated_participant_user,
        );
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User can get only their own answers');
      }
    });
    it('FindOne', async () => {
      await answersService.findOne(answer_uuid, authenticated_participant_user);

      expect(mockPrismaService.answer.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.answer.findUnique).toHaveBeenCalledWith({
        include: {
          answer_by_user: {
            select: {
              created_at: true,
              email: true,
              id: true,
              name: true,
              role: true,
              updated_at: true,
            },
          },
          question: true,
        },
        where: { id: answer_uuid },
      });
    });
  });

  describe('Update', () => {
    it('User can update only their own answers', async () => {
      const answerEntity: Partial<AnswerEntity> = {
        id: answer_uuid,
        answer: 'answer',
        answer_by_user_id: answer_creator_uuid,
      };

      mockPrismaService.answer.findUnique.mockReturnValueOnce(answerEntity);

      const answerDto: UpdateAnswerDto = {
        answer: 'Update',
      };

      try {
        await answersService.update(
          answer_uuid,
          answerDto,
          authenticated_user_id,
        );
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User can update only their own answers');
      }

      expect(mockPrismaService.answer.update).toHaveBeenCalledTimes(0);
    });

    it('Update', async () => {
      const answerEntity: Partial<AnswerEntity> = {
        id: answer_uuid,
        answer: 'answer',
        answer_by_user_id: authenticated_user_id,
      };

      mockPrismaService.answer.findUnique.mockReturnValueOnce(answerEntity);

      const answerDto: UpdateAnswerDto = {
        answer: 'Update',
      };

      await answersService.update(
        answer_uuid,
        answerDto,
        authenticated_user_id,
      );

      expect(mockPrismaService.answer.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.answer.update).toHaveBeenCalledWith({
        data: {
          answer: answerDto.answer,
        },
        include: {
          answer_by_user: {
            select: {
              created_at: true,
              email: true,
              id: true,
              name: true,
              role: true,
              updated_at: true,
            },
          },
          question: true,
        },
        where: { id: answer_uuid },
      });
    });
  });

  describe('remove', () => {
    it('User can delete only their own answers', async () => {
      const answerEntity: Partial<AnswerEntity> = {
        id: answer_uuid,
        answer: 'answer',
        answer_by_user_id: answer_creator_uuid,
      };

      mockPrismaService.answer.findUnique.mockReturnValueOnce(answerEntity);
      try {
        await answersService.remove(answer_uuid, authenticated_user_id);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User can delete only their own answers');
      }

      expect(mockPrismaService.answer.delete).toHaveBeenCalledTimes(0);
    });

    it('Delete', async () => {
      const answerEntity: Partial<AnswerEntity> = {
        id: answer_uuid,
        answer: 'answer',
        answer_by_user_id: authenticated_user_id,
      };

      mockPrismaService.answer.findUnique.mockReturnValueOnce(answerEntity);
      await answersService.remove(answer_uuid, authenticated_user_id);

      expect(mockPrismaService.answer.delete).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.answer.delete).toHaveBeenCalledWith({
        where: { id: answer_uuid },
      });
    });
  });
});
