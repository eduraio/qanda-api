import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OrderDto } from './order.enum';
import { PaginationResultDto } from './pagination-result.dto';

export abstract class PaginationQueryDto<T extends string = 'created_at'> {
  abstract sort: T;

  @ApiPropertyOptional({
    enum: OrderDto,
    default: OrderDto.ASC,
    enumName: 'Order',
  })
  @IsEnum(OrderDto)
  @IsOptional()
  @Transform((v) => v.value.toLowerCase())
  readonly order: OrderDto = OrderDto.ASC;

  @ApiPropertyOptional({
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Transform((v) => v.value)
  readonly offset: number = 0;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 25,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly limit: number = 25;

  sortBy(): object {
    return {
      take: this.limit,
      skip: this.offset,
      orderBy: {
        [this.sort]: this.order,
      },
    };
  }

  where(): { where: any } {
    return {
      where: undefined,
    };
  }

  createMetadata<T>(results: T[], total: number): PaginationResultDto<T> {
    return {
      limit: this.limit,
      offset: this.offset,
      results,
      total,
    };
  }
}
