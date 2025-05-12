import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsEnum, IsUUID, ValidateNested } from 'class-validator'

export class CreateFormOutputDto {
  @IsUUID()
  readonly id!: string
}

export class CreateFormOutputResponseDto {
  @ApiProperty({
    example: 'success',
    enum: ['success', 'error'],
  })
  @IsEnum(['success', 'error'])
  status!: 'success' | 'error'

  @Expose()
  @ValidateNested()
  @Type(() => CreateFormOutputDto)
  data!: CreateFormOutputDto
}
