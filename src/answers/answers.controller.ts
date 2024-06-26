import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/pagination/api-paginated-response';
import { PaginationResultDto } from '../common/pagination/pagination-result.dto';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerEntity } from './entities/answer.entity';
import { AnswerPaginationDto } from './dto/answer.pagination';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiPaginatedResponse(AnswerEntity)
  async findAll(
    @Req() request: RequestWithUser,
    @Query() pagination: AnswerPaginationDto,
  ): Promise<PaginationResultDto<AnswerEntity>> {
    return await this.answersService.findAll(pagination, request.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AnswerEntity })
  async findOne(@Req() request: RequestWithUser, @Param('id') id: string) {
    return await this.answersService.findOne(id, request.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AnswerEntity })
  async update(
    @Req() request: RequestWithUser,

    @Param('id') id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ) {
    return await this.answersService.update(
      id,
      updateAnswerDto,
      request.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AnswerEntity })
  async remove(@Req() request: RequestWithUser, @Param('id') id: string) {
    return await this.answersService.remove(id, request.user.id);
  }
}
