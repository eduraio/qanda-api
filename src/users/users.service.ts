import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserPaginationDto } from './dto/user.pagination';
import { PaginationResultDto } from '../commom/pagination/pagination-result.dto';
import { UserEntity } from './entities/user.entity';

export const hashRounds = 7;

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  includeFields = {
    answers: true,
    questions: true,
  } satisfies Prisma.UserInclude;

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      hashRounds,
    );

    createUserDto.password = hashedPassword;
    return await this.prismaService.user.create({
      data: createUserDto,
      include: this.includeFields,
    });
  }

  async findAll(
    pagination: UserPaginationDto,
  ): Promise<PaginationResultDto<UserEntity>> {
    const results: UserEntity[] = await this.prismaService.user.findMany({
      include: this.includeFields,
      ...pagination.where(),
      ...pagination.sortBy(),
    });

    const total = await this.prismaService.user.count(pagination.where());
    return pagination.createMetadata(results, total);
  }

  findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: this.includeFields,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
      include: this.includeFields,
    });
  }

  remove(id: string) {
    return this.prismaService.user.delete({ where: { id } });
  }
}
