import { ApiProperty } from '@nestjs/swagger'
import { LoginClientEnum } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpsertUserRecordClientRequestDto {
  @ApiProperty({
    description: 'Client that the user logged in through',
    enum: LoginClientEnum,
    example: LoginClientEnum.CITY_ACCOUNT,
  })
  @IsEnum(LoginClientEnum)
  loginClient!: LoginClientEnum
}
