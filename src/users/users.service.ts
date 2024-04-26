import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

const hashRounds = 7;

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  #includeFields = {
    answers: true,
    questions: true,
  } satisfies Prisma.UserInclude;

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (userExists)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      hashRounds,
    );

    createUserDto.password = hashedPassword;
    return await this.prismaService.user.create({
      data: createUserDto,
      include: this.#includeFields,
    });
  }

  findOne(id: string, authenticated_user_id: string) {
    if (id !== authenticated_user_id)
      throw new HttpException(
        'User can get only their own information',
        HttpStatus.UNAUTHORIZED,
      );
    return this.prismaService.user.findUnique({
      where: { id },
      include: this.#includeFields,
    });
  }

  findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: this.#includeFields,
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    authenticated_user_id: string,
  ) {
    if (id !== authenticated_user_id)
      throw new HttpException(
        'User can update only their own information',
        HttpStatus.UNAUTHORIZED,
      );
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
      include: this.#includeFields,
    });
  }

  remove(id: string, authenticated_user_id: string) {
    if (id !== authenticated_user_id)
      throw new HttpException(
        'User can delete only their own information',
        HttpStatus.UNAUTHORIZED,
      );
    return this.prismaService.user.delete({ where: { id } });
  }
}
