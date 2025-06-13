import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateFormInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  formDefinitionSlug!: string
}
