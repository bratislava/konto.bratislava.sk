import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { FileStatusType } from 'forms-shared/form-files/fileStatus'

import { JSON_FORM_EXAMPLE, XML_FORM_EXAMPLE } from '../../utils/constants'

export class JsonToXmlV2RequestDto {
  @IsObject()
  @ApiPropertyOptional({
    description:
      'JSON form values, if not provided the form data from the database will be used.',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  @IsOptional()
  jsonData?: PrismaJson.FormDataJson
}

export class XmlToJsonRequestDto {
  @ApiProperty({
    description: 'Form values in XML',
    example: XML_FORM_EXAMPLE,
  })
  @IsString()
  xmlForm: string
}

export class XmlToJsonResponseDto {
  @IsObject()
  @ApiProperty({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  formDataJson: PrismaJson.FormDataJson

  @ApiProperty({
    description: 'Indicates if version confirmation is required',
    example: true,
  })
  @IsNotEmpty()
  requiresVersionConfirmation: boolean
}

class ClientFileInfoFileDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  size: number
}

class ClientFileInfoStatusDto {
  @IsEnum(FileStatusType)
  type: FileStatusType
}

/**
 * Simplified representation of `ClientFileInfo` from `forms-shared/src/form-files/fileStatus.ts`.
 * Uses minimal typed shapes so that `ClientFileInfo` structurally extends this DTO,
 * allowing a single `as ClientFileInfo[]` cast without `as unknown as`.
 */
class SimplifiedClientFileInfoDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  slotId: string

  @ValidateNested()
  @Type(() => ClientFileInfoFileDto)
  file: ClientFileInfoFileDto

  @ValidateNested()
  @Type(() => ClientFileInfoStatusDto)
  status: ClientFileInfoStatusDto
}

export class ConvertToPdfRequestDto {
  @IsObject()
  @ApiPropertyOptional({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  @IsOptional()
  jsonData?: PrismaJson.FormDataJson

  @ApiPropertyOptional({
    description:
      'Used only in the FE requests to display files not yet uploaded to the server.',
  })
  @IsOptional()
  @IsObject({ each: true })
  clientFiles?: SimplifiedClientFileInfoDto[]
}
