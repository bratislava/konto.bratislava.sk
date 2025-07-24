import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

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

/**
 * Simplified representation of `ClientFileInfo` from `forms-shared/src/form-files/fileStatus.ts`.
 */
class SimplifiedClientFileInfoDto {
  @IsString()
  id: string

  @IsObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: Record<string, any>

  @IsObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status: Record<string, any>
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
