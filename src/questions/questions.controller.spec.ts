import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestionsController } from './questions.controller';
import { QuestionService } from './questions.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { RoleGuard } from '../auth/guards/permissions.guard';
import { UserRoles } from '@prisma/client';
import { QuestionPaginationDto } from './dto/question.pagination';
import { QuestionAnswersPaginationDto } from './dto/question-answers.pagination';

const question_uuid = 'd9ee9412-c79f-489a-9b98-27e5c19e6199';

describe('QuestionsController', () => {
  let questionsController: QuestionsController;

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
    findAnswersByQuestionId: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [{ provide: QuestionService, useValue: mockQuestionsService }],
    }).compile();

    questionsController = module.get<QuestionsController>(QuestionsController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(questionsController).toBeDefined();
  });

  it('create', async () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      questionsController.create,
    );
    const AuthGuard = new guards[0]();
    const RoleGuardController = new guards[1]();

    const role = Reflect.getMetadata('role', questionsController.create);

    const questionDto: CreateQuestionDto = {
      question: 'question',
    };

    await questionsController.create(requestWithUser, questionDto);

    expect(AuthGuard).toBeInstanceOf(JwtAuthGuard);
    expect(RoleGuardController).toBeInstanceOf(RoleGuard);
    expect(role).toBe(UserRoles.ORGANIZER);

    expect(requestWithUser.user.role).toBe(UserRoles.ORGANIZER);

    expect(mockQuestionsService.create).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.create).toHaveBeenCalledWith(
      questionDto,
      requestWithUser.user.id,
    );
  });

  it('findAll', async () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      questionsController.findAll,
    );
    const guard = new guards[0]();

    const pagination = {} as QuestionPaginationDto;

    await questionsController.findAll(requestWithUser, pagination);

    expect(guard).toBeInstanceOf(JwtAuthGuard);
    expect(mockQuestionsService.findAll).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.findAll).toHaveBeenCalledWith(
      pagination,
      requestWithUser.user.id,
    );
  });

  it('findOne', async () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      questionsController.findOne,
    );
    const guard = new guards[0]();

    await questionsController.findOne(requestWithUser, question_uuid);

    expect(guard).toBeInstanceOf(JwtAuthGuard);
    expect(mockQuestionsService.findOne).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.findOne).toHaveBeenCalledWith(
      question_uuid,
      requestWithUser.user.id,
    );
  });

  it('update', async () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      questionsController.create,
    );
    const AuthGuard = new guards[0]();
    const RoleGuardController = new guards[1]();

    const role = Reflect.getMetadata('role', questionsController.create);

    const questionDto: UpdateQuestionDto = {
      question: 'another one',
    };

    await questionsController.update(
      requestWithUser,
      question_uuid,
      questionDto,
    );

    expect(AuthGuard).toBeInstanceOf(JwtAuthGuard);
    expect(RoleGuardController).toBeInstanceOf(RoleGuard);
    expect(role).toBe(UserRoles.ORGANIZER);

    expect(mockQuestionsService.update).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.update).toHaveBeenCalledWith(
      question_uuid,
      questionDto,
      requestWithUser.user.id,
    );
  });

  it('remove', async () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      questionsController.create,
    );
    const AuthGuard = new guards[0]();
    const RoleGuardController = new guards[1]();

    const role = Reflect.getMetadata('role', questionsController.create);

    await questionsController.remove(requestWithUser, question_uuid);

    expect(AuthGuard).toBeInstanceOf(JwtAuthGuard);
    expect(RoleGuardController).toBeInstanceOf(RoleGuard);
    expect(role).toBe(UserRoles.ORGANIZER);

    expect(mockQuestionsService.remove).toHaveBeenCalledTimes(1);
    expect(mockQuestionsService.remove).toHaveBeenCalledWith(
      question_uuid,
      requestWithUser.user.id,
    );
  });

  it('findAnswersByQuestionId', async () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      questionsController.findAnswersByQuestionId,
    );
    const guard = new guards[0]();
    const RoleGuardController = new guards[1]();

    const role = Reflect.getMetadata('role', questionsController.create);

    const pagination = {} as QuestionAnswersPaginationDto;

    await questionsController.findAnswersByQuestionId(
      question_uuid,
      pagination,
    );

    expect(RoleGuardController).toBeInstanceOf(RoleGuard);
    expect(role).toBe(UserRoles.ORGANIZER);
    expect(guard).toBeInstanceOf(JwtAuthGuard);

    expect(mockQuestionsService.findAnswersByQuestionId).toHaveBeenCalledTimes(
      1,
    );
    expect(mockQuestionsService.findAnswersByQuestionId).toHaveBeenCalledWith(
      question_uuid,
      pagination,
    );
  });
});
