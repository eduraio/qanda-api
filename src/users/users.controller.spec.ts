import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './users.service';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const user_uuid = 'd9ee9412-c79f-489a-9b98-27e5c19e6199';

describe('UsersController', () => {
  let usersController: UsersController;

  const authenticated_user: Partial<UserEntity> = {
    id: '35a867e4-f09b-45cf-868e-cb48ae3dd6bf',
  };
  const requestWithUser = {
    user: authenticated_user,
  } as RequestWithUser;

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UserService, useValue: mockUsersService }],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('create', async () => {
    const userDto: CreateUserDto = {
      name: 'test user',
      email: 'test@email.com',
      password: 'password',
      role: 'PARTICIPANT',
    };

    await usersController.create(userDto);

    expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    expect(mockUsersService.create).toHaveBeenCalledWith(userDto);
  });

  it('findOne', async () => {
    const guards = Reflect.getMetadata('__guards__', usersController.findOne);
    const guard = new guards[0]();

    await usersController.findOne(requestWithUser, user_uuid);

    expect(guard).toBeInstanceOf(JwtAuthGuard);
    expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findOne).toHaveBeenCalledWith(
      user_uuid,
      requestWithUser.user.id,
    );
  });

  it('update', async () => {
    const guards = Reflect.getMetadata('__guards__', usersController.update);
    const guard = new guards[0]();

    const userDto: UpdateUserDto = {
      name: 'Update Test',
    };

    await usersController.update(requestWithUser, user_uuid, userDto);

    expect(guard).toBeInstanceOf(JwtAuthGuard);
    expect(mockUsersService.update).toHaveBeenCalledTimes(1);
    expect(mockUsersService.update).toHaveBeenCalledWith(
      user_uuid,
      userDto,
      requestWithUser.user.id,
    );
  });

  it('remove', async () => {
    const guards = Reflect.getMetadata('__guards__', usersController.remove);
    const guard = new guards[0]();

    await usersController.remove(requestWithUser, user_uuid);

    expect(guard).toBeInstanceOf(JwtAuthGuard);
    expect(mockUsersService.remove).toHaveBeenCalledTimes(1);
    expect(mockUsersService.remove).toHaveBeenCalledWith(
      user_uuid,
      requestWithUser.user.id,
    );
  });
});
