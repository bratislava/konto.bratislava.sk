import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

import { JSON_FORM_EXAMPLE } from '../utils/constants'

export class SignerDataRequestDto {
  @ApiProperty({
    description: 'Form id',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  formId: string

  @IsObject()
  @ApiProperty({
    description: 'Form values in JSON',
    example: JSON_FORM_EXAMPLE,
  })
  @IsNotEmpty()
  @IsOptional()
  formDataJson!: PrismaJson.FormDataJson
}

/**
 * Response DTO for signer data. The implementation and generation of these values can be found in:
 * - forms-shared/src/signer/signerData.ts
 */
export class SignerDataResponseDto {
  @ApiProperty()
  @IsString()
  signatureId!: string

  @ApiProperty({ example: 'Vseobecna_agenda.xml' })
  @IsString()
  objectId!: string

  @ApiProperty({ example: 'Všeobecná agenda' })
  @IsString()
  objectDescription!: string

  @ApiProperty({ example: 'http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2' })
  @IsString()
  objectFormatIdentifier!: string

  @ApiProperty()
  @IsString()
  xdcXMLData!: string

  @ApiProperty({
    example: 'http://data.gov.sk/doc/eform/Doc.GeneralAgenda/1.2',
  })
  @IsString()
  xdcIdentifier!: string

  @ApiProperty({ example: '1.2' })
  @IsString()
  xdcVersion!: string

  @ApiProperty()
  @IsString()
  xdcUsedXSD!: string

  @ApiProperty({ example: 'http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2' })
  @IsString()
  xsdReferenceURI!: string

  @ApiProperty()
  @IsString()
  xdcUsedXSLT!: string

  @ApiProperty({
    example: 'http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2/form.xslt',
  })
  @IsString()
  xslReferenceURI!: string

  @ApiProperty({ example: 'HTML' })
  @IsString()
  xslMediaDestinationTypeDescription!: string

  @ApiProperty({ example: 'sk' })
  @IsString()
  xslXSLTLanguage!: string

  @ApiProperty({ example: '' })
  @IsString()
  xslTargetEnvironment!: string

  @ApiProperty({ example: true })
  @IsBoolean()
  xdcIncludeRefs!: boolean

  @ApiProperty({
    example: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.1',
  })
  @IsString()
  xdcNamespaceURI!: string
}
