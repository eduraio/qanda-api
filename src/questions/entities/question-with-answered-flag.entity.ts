import { ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionEntity } from './question.entity';

export class QuestionWithAnsweredFlag extends QuestionEntity {
  @ApiPropertyOptional()
  answered_by_me: boolean;
}
