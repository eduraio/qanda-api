import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const uuid = 'd9ee9412-c79f-489a-9b98-27e5c19e6199';
const authenticated_user_id = '35a867e4-f09b-45cf-868e-cb48ae3dd6bf';

describe('userService', () => {
  let userService: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('User already exists', async () => {
      const userDto: CreateUserDto = {
        name: 'Exists User Test',
        email: 'exist@email.com',
        password: 'password',
        role: 'PARTICIPANT',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(userDto);

      try {
        await userService.create(userDto);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User already exists');
      }

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userDto.email },
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(0);
    });

    it('Create Participant user', async () => {
      const userDto: CreateUserDto = {
        name: 'Participant',
        email: 'participant@email.com',
        password: 'password',
        role: 'PARTICIPANT',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(null);

      await userService.create(userDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userDto.email },
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        include: {
          answers: true,
          questions: true,
        },
        data: {
          email: userDto.email,
          name: userDto.name,
          password: userDto.password,
          role: userDto.role,
        },
      });
    });

    it('Create Organizer user', async () => {
      const userDto: CreateUserDto = {
        name: 'Organizer',
        email: 'organizer@email.com',
        password: 'password',
        role: 'ORGANIZER',
      };

      mockPrismaService.user.findUnique.mockReturnValueOnce(null);

      await userService.create(userDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: userDto.email },
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        include: {
          answers: true,
          questions: true,
        },
        data: {
          email: userDto.email,
          name: userDto.name,
          password: userDto.password,
          role: userDto.role,
        },
      });
    });
  });

  describe('findOne', () => {
    it('User can get only their own information', async () => {
      try {
        await userService.findOne(uuid, authenticated_user_id);

        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User can get only their own information');
      }

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(0);
    });

    it('findOne', async () => {
      await userService.findOne(uuid, uuid);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: uuid },
        include: {
          answers: true,
          questions: true,
        },
      });
    });
  });

  describe('update', () => {
    it('User can update only their own information', async () => {
      const userDto: UpdateUserDto = {
        name: 'Update',
      };

      try {
        await userService.update(uuid, userDto, authenticated_user_id);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          'User can update only their own information',
        );
      }

      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(0);
    });

    it('Update user', async () => {
      const userDto: UpdateUserDto = {
        name: 'Update',
      };
      await userService.update(uuid, userDto, uuid);

      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: uuid },
        data: {
          name: userDto.name,
        },
        include: {
          answers: true,
          questions: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('User can delete only their own information', async () => {
      try {
        await userService.remove(uuid, authenticated_user_id);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          'User can delete only their own information',
        );
      }

      expect(mockPrismaService.user.delete).toHaveBeenCalledTimes(0);
    });

    it('Delete user', async () => {
      await userService.remove(uuid, uuid);

      expect(mockPrismaService.user.delete).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: uuid },
      });
    });
  });
});
