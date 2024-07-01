import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { RJSFSchema } from '@rjsf/utils'
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { ClientFileInfo } from 'forms-shared/form-files/fileStatus'

import { JSON_FORM_EXAMPLE, XML_FORM_EXAMPLE } from '../../utils/constants'

export class JsonConvertRequestDto {
  @IsObject()
  @ApiProperty({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  @IsOptional()
  jsonForm!: Prisma.JsonObject
}

export class JsonToXmlV2RequestDto {
  @ApiPropertyOptional({
    description: 'Form id. If jsonData is not provided, this is required.',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  @IsOptional()
  formId?: string

  @ApiProperty({
    description: 'Slug of the form definition',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
  })
  @IsString()
  slug: string

  @IsObject()
  @ApiPropertyOptional({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  @IsOptional()
  jsonData?: Prisma.JsonValue
}

export class XmlToJsonRequestDto {
  @ApiProperty({
    description: 'Form values in XML',
    example: XML_FORM_EXAMPLE,
  })
  @IsString()
  xmlForm!: string
}

export class XmlToJsonResponseDto {
  @IsObject()
  @ApiProperty({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  jsonForm!: RJSFSchema
}

export class ConvertToPdfV2RequestDto {
  @ApiProperty({
    description: 'Form id',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  formId: string

  @IsObject()
  @ApiPropertyOptional({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  @IsOptional()
  jsonData?: Prisma.JsonValue

  @ApiPropertyOptional({
    description:
      'Used only in the FE requests to display files not yet uploaded to the server.',
  })
  @IsOptional()
  clientFiles?: ClientFileInfo[]
}
