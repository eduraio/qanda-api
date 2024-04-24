import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  answer: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  question_id: string;
}
