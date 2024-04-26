import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAnswersService = {
    login: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAnswersService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('login', async () => {
    const userDto: LoginDto = {
      email: 'test@email.com',
      password: 'password',
    };

    await authController.login(userDto);

    expect(mockAnswersService.login).toHaveBeenCalledTimes(1);
    expect(mockAnswersService.login).toHaveBeenCalledWith(
      userDto.email,
      userDto.password,
    );
  });
});
