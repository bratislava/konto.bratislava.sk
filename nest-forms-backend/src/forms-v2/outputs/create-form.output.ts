import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class CreateFormOutput {
  @ApiProperty()
  @IsUUID()
  formId!: string
}
