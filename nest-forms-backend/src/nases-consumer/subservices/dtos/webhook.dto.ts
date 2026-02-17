import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator'

export default class WebhookDto {
  @ApiProperty({
    description: 'UUID of the form',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  formId: string

  @ApiProperty({
    description: 'Slug of the form',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
  })
  @IsString()
  @IsNotEmpty()
  slug: string

  @ApiProperty({
    description: 'JSON version of the form',
    example: '1.0.0',
  })
  @IsString()
  @IsNotEmpty()
  jsonVersion: string

  @ApiProperty({
    description: 'Data of the form',
    example: {
      name: 'John Doe',
      address: '123 Main St, Anytown, USA',
    },
  })
  @IsObject()
  data: PrismaJson.FormDataJson

  @ApiProperty({
    description: 'Files of the form',
    example: {
      '1234567890': {
        url: 'https://example.com/file.pdf',
        fileName: 'file.pdf',
      },
    },
  })
  @IsObject()
  files: Record<string, { url: string; fileName: string }>
}
