import { ApiProperty } from '@nestjs/swagger'
import { FormState } from '@prisma/client'
import { IsEnum, IsString, IsUUID } from 'class-validator'

export class SendFormResponseDto {
  @ApiProperty({
    description: 'Id of record',
    default: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  declare id: string

  @ApiProperty({
    description: 'Message response regarding the process',
    default: 'Form was sucessfully queued to rabbitmq.',
  })
  @IsString()
  declare message: string

  @ApiProperty({
    description: 'Form state',
    default: FormState.QUEUED,
  })
  @IsEnum(FormState)
  declare state: FormState
}
