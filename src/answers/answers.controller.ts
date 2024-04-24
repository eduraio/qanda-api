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
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../commom/pagination/api-paginated-response';
import { PaginationResultDto } from '../commom/pagination/pagination-result.dto';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerEntity } from './entities/answer.entity';
import { AnswerPaginationDto } from './dto/answer.pagination';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequiredRole } from '../auth/decorators/permissions.decorator';
import { UserRoles } from '@prisma/client';
import { RoleGuard } from '../auth/guards/permissions.guard';
import { RequestWithUser } from '../commom/interfaces/request-with-user.interface';

@ApiTags('Answers')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AnswerEntity })
  async create(
    @Req() request: RequestWithUser,
    @Body() createAnswerDto: CreateAnswerDto,
  ) {
    return await this.answersService.create(createAnswerDto, request.user.id);
  }

  @Get()
  @RequiredRole(UserRoles.ORGANIZER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiPaginatedResponse(AnswerEntity)
  @ApiOkResponse({ type: AnswerEntity, isArray: true })
  async findAll(
    @Query() pagination: AnswerPaginationDto,
  ): Promise<PaginationResultDto<AnswerEntity>> {
    return await this.answersService.findAll(pagination);
  }

  @Get(':id')
  @RequiredRole(UserRoles.ORGANIZER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AnswerEntity })
  async findOne(@Param('id') id: string) {
    const answer = await this.answersService.findOne(id);

    if (!answer) throw new NotFoundException(`Answer Not Found (${id})`);

    return answer;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AnswerEntity })
  async update(
    @Param('id') id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    return await this.answersService.update(id, updateAnswerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return await this.answersService.remove(id);
  }
}
