import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { RJSFSchema, UiSchema } from '@rjsf/utils'
import { Type } from 'class-transformer'
import {
  IsDefined,
  IsJSON,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

import { GetFileResponseReducedDto } from '../../files/files.dto'
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

export class PdfPreviewDataRequestDto {
  @ApiProperty({
    description: 'JWT token for retrieving the form data from the data store',
  })
  @IsString()
  jwtToken!: string
}

export class PdfPreviewDataResponseDto {
  @IsObject()
  @ApiProperty({
    description: 'schema.json',
    default: {},
  })
  @IsJSON()
  @IsNotEmpty()
  jsonSchema: RJSFSchema

  @IsObject()
  @ApiProperty({
    description: 'uiSchema.json',
    default: {},
  })
  @IsJSON()
  @IsNotEmpty()
  uiSchema: UiSchema

  @IsObject()
  @ApiProperty({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsJSON()
  @IsNotEmpty()
  @IsOptional()
  jsonForm: Prisma.JsonValue

  @IsDefined()
  @ApiProperty({
    type: [GetFileResponseReducedDto],
  })
  @Type(() => GetFileResponseReducedDto)
  serverFiles: GetFileResponseReducedDto[]

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description:
      'Additional metadata for Next server provided in convert PDF request.',
    type: 'object',
    default: {},
  })
  additionalMetadata?: Prisma.JsonObject
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

  @IsObject()
  @ApiPropertyOptional({
    description:
      'Additional metadata for Next server provided in convert PDF request.',
  })
  @IsNotEmpty()
  @IsOptional()
  additionalMetadata?: Prisma.JsonObject
}
