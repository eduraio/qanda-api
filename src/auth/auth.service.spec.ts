import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';

describe('authService', () => {
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('Login', () => {
    it('Invalid e-mail and/or password (Not Found)', async () => {
      const loginDto: LoginDto = {
        email: 'user@email.com',
        password: 'password',
      };

      try {
        await authService.login(loginDto.email, loginDto.password);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Invalid e-mail and/or password');
      }

      expect(mockJwtService.sign).toHaveBeenCalledTimes(0);
    });

    it('Invalid e-mail and/or password (Incorrect Password)', async () => {
      const userDto: Partial<CreateUserDto> = {
        email: 'user@email.com',
        password: await bcrypt.hash('password', 7),
      };
      const loginDto: LoginDto = {
        email: 'user@email.com',
        password: 'wrong_password',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(userDto);

      try {
        await authService.login(loginDto.email, loginDto.password);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Invalid e-mail and/or password');
      }

      expect(mockJwtService.sign).toHaveBeenCalledTimes(0);
    });

    it('login', async () => {
      const userDto: Partial<UserEntity> = {
        id: '35a867e4-f09b-45cf-868e-cb48ae3dd6bf',
        email: 'user@email.com',
        password: await bcrypt.hash('password', 7),
      };
      const loginDto: LoginDto = {
        email: 'user@email.com',
        password: 'password',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(userDto);

      await authService.login(loginDto.email, loginDto.password);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: userDto.id });
    });
  });
});
