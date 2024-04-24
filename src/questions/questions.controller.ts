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
    @Query() pagination: QuestionPaginationDto,
  ): Promise<PaginationResultDto<QuestionEntity>> {
    return await this.questionService.findAll(pagination);
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
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @RequiredRole(UserRoles.ORGANIZER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return await this.questionService.remove(id);
  }
}
