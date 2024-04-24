import { ApiProperty } from '@nestjs/swagger';

export class AnswerEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  answer: string;

  @ApiProperty()
  answer_by_user_id: string;

  @ApiProperty()
  question_id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
