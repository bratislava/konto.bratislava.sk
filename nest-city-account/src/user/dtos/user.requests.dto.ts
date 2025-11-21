import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { LoginClientEnum } from '@prisma/client'

export class UpsertUserRecordClientRequestDto {
  @ApiProperty({
    description: 'Client that the user logged in through',
    enum: LoginClientEnum,
    example: LoginClientEnum.CITY_ACCOUNT,
  })
  @IsEnum(LoginClientEnum)
  loginClient!: LoginClientEnum
}
