import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator'
import type {
  ApiCepVerifyPost200Response,
  ApiCepVerifyPost200ResponseVerifiedObjectsInner,
  ApiCepVerifyPostRequest,
} from 'openapi-clients/slovensko-sk'

import { JSON_FORM_EXAMPLE } from '../utils/constants'

export class SignerDataRequestDto {
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

  // eslint-disable-next-line sonarjs/no-clear-text-protocols -- Swagger example only; Slovak government XML schema URIs use http:// by official specification as namespace identifiers, not network endpoints
  @ApiProperty({ example: 'http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2' })
  @IsString()
  objectFormatIdentifier!: string

  @ApiProperty()
  @IsString()
  xdcXMLData!: string

  @ApiProperty({
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- Swagger example only; Slovak government XML schema URIs use http:// by official specification as namespace identifiers, not network endpoints
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

  // eslint-disable-next-line sonarjs/no-clear-text-protocols -- Swagger example only; Slovak government XML schema URIs use http:// by official specification as namespace identifiers, not network endpoints
  @ApiProperty({ example: 'http://schemas.gov.sk/form/Doc.GeneralAgenda/1.2' })
  @IsString()
  xsdReferenceURI!: string

  @ApiProperty()
  @IsString()
  xdcUsedXSLT!: string

  @ApiProperty({
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- Swagger example only; Slovak government XML schema URIs use http:// by official specification as namespace identifiers, not network endpoints
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
    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- Swagger example only; Slovak government XML schema URIs use http:// by official specification as namespace identifiers, not network endpoints
    example: 'http://data.gov.sk/def/container/xmldatacontainer+xml/1.1',
  })
  @IsString()
  xdcNamespaceURI!: string
}

export class VerifySignatureRequestDto implements ApiCepVerifyPostRequest {
  @ApiProperty({
    description:
      'Base64 encoded content of the object to verify. Can be an ASiC-E CAdES, ASiC-E XAdES, CAdES, PAdES, XAdES or MessageContainer object.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string
}

/**
 * Passthrough response of the Slovensko.sk `POST /api/cep/verify` endpoint. The properties intentionally keep the
 * upstream snake_case naming.
 */
export class VerifySignatureResponseDto implements ApiCepVerifyPost200Response {
  @ApiProperty({ description: 'Verification result code.', example: 0 })
  @IsNumber()
  verify_result!: number

  @ApiProperty({
    description: 'Verification result description.',
    example: 'OK',
  })
  @IsString()
  verify_description!: string

  @ApiPropertyOptional({
    description:
      'Verified objects. The shape differs per signature type (ASiC-E CAdES, ASiC-E XAdES, CAdES, PAdES, XAdES).',
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  @IsOptional()
  @IsObject({ each: true })
  verified_objects?: ApiCepVerifyPost200ResponseVerifiedObjectsInner[]
}
