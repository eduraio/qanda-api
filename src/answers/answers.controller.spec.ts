import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { UserEntity } from '../users/entities/user.entity';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerPaginationDto } from './dto/answer.pagination';
import { UpdateAnswerDto } from './dto/update-answer.dto';

const question_uuid = '5ed563bc-753c-4355-9c26-c837c7fa4997';
const answer_uuid = 'd9ee9412-c79f-489a-9b98-27e5c19e6199';

describe('AnswersController', () => {
  let answersController: AnswersController;

  const authenticated_user: Partial<UserEntity> = {
    id: '35a867e4-f09b-45cf-868e-cb48ae3dd6bf',
    role: 'ORGANIZER',
  };

  const requestWithUser = {
    user: authenticated_user,
  } as RequestWithUser;

  const mockQuestionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [{ provide: AnswersService, useValue: mockQuestionsService }],
    }).compile();

    answersController = module.get<AnswersController>(AnswersController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(answersController).toBeDefined();
  });

  it('create', async () => {
    const guards = Reflect.getMetadata('__guards__', answersController.create);
    const AuthGuard = new guards[0]();

    const answerDto: CreateAnswerDto = {
      answer: 'answer',
      question_id: question_uuid,
    };

    await answersController.create(requestWithUser, answerDto);

    expect(AuthGuard).toBeInstanceOf(JwtAuthGuard);

    expect(mockQuestionsService.create).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.create).toHaveBeenCalledWith(
      answerDto,
      requestWithUser.user.id,
    );
  });

  it('findAll', async () => {
    const guards = Reflect.getMetadata('__guards__', answersController.findAll);
    const guard = new guards[0]();

    const pagination = {} as AnswerPaginationDto;

    await answersController.findAll(requestWithUser, pagination);

    expect(guard).toBeInstanceOf(JwtAuthGuard);
    expect(mockQuestionsService.findAll).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.findAll).toHaveBeenCalledWith(
      pagination,
      requestWithUser.user,
    );
  });

  it('findOne', async () => {
    const guards = Reflect.getMetadata('__guards__', answersController.findOne);
    const guard = new guards[0]();

    await answersController.findOne(requestWithUser, answer_uuid);

    expect(guard).toBeInstanceOf(JwtAuthGuard);
    expect(mockQuestionsService.findOne).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.findOne).toHaveBeenCalledWith(
      answer_uuid,
      requestWithUser.user,
    );
  });

  it('update', async () => {
    const guards = Reflect.getMetadata('__guards__', answersController.create);
    const AuthGuard = new guards[0]();

    const answerDto: UpdateAnswerDto = {
      answer: 'another one',
    };

    await answersController.update(requestWithUser, answer_uuid, answerDto);

    expect(AuthGuard).toBeInstanceOf(JwtAuthGuard);

    expect(mockQuestionsService.update).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.update).toHaveBeenCalledWith(
      answer_uuid,
      answerDto,
      requestWithUser.user.id,
    );
  });

  it('remove', async () => {
    const guards = Reflect.getMetadata('__guards__', answersController.create);
    const AuthGuard = new guards[0]();

    await answersController.remove(requestWithUser, answer_uuid);

    expect(AuthGuard).toBeInstanceOf(JwtAuthGuard);

    expect(mockQuestionsService.remove).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.remove).toHaveBeenCalledWith(
      answer_uuid,
      requestWithUser.user.id,
    );
  });
});
