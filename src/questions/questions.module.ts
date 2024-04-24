import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionService } from './questions.service';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionService],
  exports: [],
})
export class QuestionsModule {}
