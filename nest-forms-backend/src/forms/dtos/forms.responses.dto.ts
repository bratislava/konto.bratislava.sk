import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsUUID } from 'class-validator'

export default class FormDeleteResponseDto {
  @ApiProperty({
    description: 'True if the form was successfully archived.',
    example: true,
  })
  @IsBoolean()
  archived: boolean

  @ApiProperty({
    description: 'UUID of the archived form.',
    example: 'e5c84a71-5985-40c7-bb19-e4ad22eda41c',
  })
  @IsUUID()
  formId: string
}
