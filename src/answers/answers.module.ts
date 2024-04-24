import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';

@Module({
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [],
})
export class AnswersModule {}
