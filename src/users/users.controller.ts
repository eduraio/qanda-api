import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiPaginatedResponse } from '../commom/pagination/api-paginated-response';
import { UserPaginationDto } from './dto/user.pagination';
import { PaginationResultDto } from '../commom/pagination/pagination-result.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOkResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      ...user,
      password: undefined,
    };
  }

  @Get()
  @ApiPaginatedResponse(UserEntity)
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll(
    @Query() pagination: UserPaginationDto,
  ): Promise<PaginationResultDto<UserEntity>> {
    return await this.userService.findAll(pagination);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);

    if (!user) throw new NotFoundException(`User Not Found (${id})`);

    return {
      ...user,
      password: undefined,
    };
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      ...user,
      password: undefined,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    return {
      ...user,
      password: undefined,
    };
  }
}
