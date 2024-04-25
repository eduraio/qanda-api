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
import { QuestionService } from './questions.service';
import { QuestionEntity } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionPaginationDto } from './dto/question.pagination';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UserRoles } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequiredRole } from '../auth/decorators/permissions.decorator';
import { RoleGuard } from '../auth/guards/permissions.guard';
import { RequestWithUser } from '../commom/interfaces/request-with-user.interface';
import { AnswerEntity } from '../answers/entities/answer.entity';
import { QuestionAnswersPaginationDto } from './dto/question-answers.pagination';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @RequiredRole(UserRoles.ORGANIZER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: QuestionEntity })
  async create(
    @Req() request: RequestWithUser,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return await this.questionService.create(
      createQuestionDto,
      request.user.id,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiPaginatedResponse(QuestionEntity)
  @ApiOkResponse({ type: QuestionEntity, isArray: true })
  async findAll(
    @Req() request: RequestWithUser,
    @Query() pagination: QuestionPaginationDto,
  ) {
    return await this.questionService.findAll(pagination, request.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: QuestionEntity })
  async findOne(@Param('id') id: string) {
    const question = await this.questionService.findOne(id);

    if (!question) throw new NotFoundException(`Question Not Found (${id})`);

    return question;
  }

  @Patch(':id')
  @RequiredRole(UserRoles.ORGANIZER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: QuestionEntity })
  async update(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.update(
      id,
      updateQuestionDto,
      request.user.id,
    );
  }

  @Delete(':id')
  @RequiredRole(UserRoles.ORGANIZER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  async remove(@Req() request: RequestWithUser, @Param('id') id: string) {
    return await this.questionService.remove(id, request.user.id);
  }

  @Get(':id/answers')
  @RequiredRole(UserRoles.ORGANIZER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiPaginatedResponse(AnswerEntity)
  @ApiOkResponse({ type: AnswerEntity, isArray: true })
  async findAnswersByQuestionId(
    @Param('id') id: string,
    @Query() pagination: QuestionAnswersPaginationDto,
  ): Promise<PaginationResultDto<AnswerEntity>> {
    return await this.questionService.findAnswersByQuestionId(id, pagination);
  }
}
