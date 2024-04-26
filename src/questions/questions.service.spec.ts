import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionPaginationDto } from './dto/question.pagination';
import { QuestionEntity } from './entities/question.entity';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { HttpException } from '@nestjs/common';
import { QuestionAnswersPaginationDto } from './dto/question-answers.pagination';

const question_uuid = 'd9ee9412-c79f-489a-9b98-27e5c19e6199';
const authenticated_user_id = '35a867e4-f09b-45cf-868e-cb48ae3dd6bf';
const created_by_user_id = '8ace5391-99da-4de8-a974-5de0371df0e2';

describe('questionsService', () => {
  let questionsService: QuestionService;

  const mockPrismaService = {
    answer: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    question: {
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
        QuestionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    questionsService = module.get<QuestionService>(QuestionService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(questionsService).toBeDefined();
  });

  it('Create', async () => {
    const questionDto: CreateQuestionDto = {
      question: 'question',
    };

    await questionsService.create(questionDto, authenticated_user_id);

    expect(mockPrismaService.question.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.question.create).toHaveBeenCalledWith({
      include: {
        answers: true,
      },
      data: {
        question: questionDto.question,
        created_by_user_id: authenticated_user_id,
      },
    });
  });

  it('findAll', async () => {
    const questionDto: Partial<QuestionEntity> = {
      id: question_uuid,
      question: 'question',
    };

    const pagination = {
      where: () => {},
      sortBy: () => {},
      createMetadata: (sort: any, order: any, offset: any, limit: any) => {},
    } as QuestionPaginationDto;

    mockPrismaService.question.findMany.mockReturnValueOnce([questionDto]);

    await questionsService.findAll(pagination, authenticated_user_id);

    expect(mockPrismaService.question.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.question.findMany).toHaveBeenCalledWith({
      include: {
        answers: true,
      },
    });
  });

  it('findOne', async () => {
    await questionsService.findOne(question_uuid, authenticated_user_id);

    expect(mockPrismaService.question.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.question.findUnique).toHaveBeenCalledWith({
      where: { id: question_uuid },
      include: {
        answers: true,
      },
    });
  });

  describe('update', () => {
    it('User can update only their own questions', async () => {
      const createdQuestionDto: Partial<QuestionEntity> = {
        id: question_uuid,
        question: 'question',
        created_by_user_id: created_by_user_id,
      };

      mockPrismaService.question.findUnique.mockReturnValueOnce(
        createdQuestionDto,
      );

      const questionDto: UpdateQuestionDto = {
        question: 'Update',
      };

      try {
        await questionsService.update(
          question_uuid,
          questionDto,
          authenticated_user_id,
        );
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User can update only their own questions');
      }

      expect(mockPrismaService.question.update).toHaveBeenCalledTimes(0);
    });

    it('Update', async () => {
      const createdQuestionDto: Partial<QuestionEntity> = {
        id: question_uuid,
        question: 'question',
        created_by_user_id: created_by_user_id,
      };

      mockPrismaService.question.findUnique.mockReturnValueOnce(
        createdQuestionDto,
      );

      const questionDto: UpdateQuestionDto = {
        question: 'Update',
      };

      await questionsService.update(
        question_uuid,
        questionDto,
        created_by_user_id,
      );

      expect(mockPrismaService.question.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.question.update).toHaveBeenCalledWith({
        where: { id: question_uuid },
        data: {
          question: questionDto.question,
        },
        include: {
          answers: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('User can delete only their own questions', async () => {
      const createdQuestionDto: Partial<QuestionEntity> = {
        id: question_uuid,
        question: 'question',
        created_by_user_id: created_by_user_id,
      };

      mockPrismaService.question.findUnique.mockReturnValueOnce(
        createdQuestionDto,
      );
      try {
        await questionsService.remove(question_uuid, authenticated_user_id);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User can delete only their own questions');
      }

      expect(mockPrismaService.question.delete).toHaveBeenCalledTimes(0);
    });

    it('Delete', async () => {
      const createdQuestionDto: Partial<QuestionEntity> = {
        id: question_uuid,
        question: 'question',
        created_by_user_id: created_by_user_id,
      };

      mockPrismaService.question.findUnique.mockReturnValueOnce(
        createdQuestionDto,
      );
      await questionsService.remove(question_uuid, created_by_user_id);

      expect(mockPrismaService.question.delete).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.question.delete).toHaveBeenCalledWith({
        where: { id: question_uuid },
      });
    });
  });

  it('findAnswersByQuestionId', async () => {
    const questionDto: Partial<QuestionEntity> = {
      id: question_uuid,
      question: 'question',
    };

    const pagination = {
      where: () => {},
      sortBy: () => {},
      createMetadata: (sort: any, order: any, offset: any, limit: any) => {},
    } as QuestionAnswersPaginationDto;

    mockPrismaService.question.findMany.mockReturnValueOnce([questionDto]);

    await questionsService.findAnswersByQuestionId(question_uuid, pagination);

    expect(mockPrismaService.answer.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.answer.findMany).toHaveBeenCalledWith({});
  });
});
