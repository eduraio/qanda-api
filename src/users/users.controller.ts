import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Req() request: RequestWithUser, @Param('id') id: string) {
    const user = await this.userService.findOne(id, request.user.id);

    if (!user) return;

    return {
      ...user,
      password: undefined,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async update(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update(
      id,
      updateUserDto,
      request.user.id,
    );
    return {
      ...user,
      password: undefined,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  async remove(@Req() request: RequestWithUser, @Param('id') id: string) {
    const user = await this.userService.remove(id, request.user.id);
    return {
      ...user,
      password: undefined,
    };
  }
}
