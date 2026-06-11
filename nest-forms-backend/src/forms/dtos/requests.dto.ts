import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FormError, FormState } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBase64,
  IsBoolean,
  IsDate,
  IsEnum,
  IsHash,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../utils/constants'
import { ToBoolean } from '../../utils/decorators/request.decorator'

export class FormSignatureDto {
  @ApiProperty({
    description: 'Base64 encoded signature',
  })
  @IsString()
  @IsNotEmpty()
  @IsBase64()
  signatureBase64: string

  @ApiProperty({
    description: 'POSP ID of the form',
  })
  @IsString()
  @IsNotEmpty()
  pospID: string

  @ApiProperty({
    description: 'POSP version of the form',
  })
  @IsString()
  @IsNotEmpty()
  pospVersion: string

  @ApiProperty({
    description: 'JSON version of the form',
  })
  @IsString()
  @IsNotEmpty()
  jsonVersion: string

  @ApiProperty({
    description: 'Hash of the form data',
  })
  @IsString()
  @IsNotEmpty()
  @IsHash('sha1')
  formDataHash: string
}

export class FormUpdateBodyDto {
  // eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
  @ApiPropertyOptional({
    description: 'Send JSON body of form',
    default: {},
    nullable: true,
  })
  @IsOptional()
  formDataJson?: PrismaJson.FormDataJson

  @ApiPropertyOptional({
    description: 'State of form ',
    default: FormState.DRAFT,
  })
  @IsOptional()
  @IsEnum(FormState)
  state?: FormState

  @ApiPropertyOptional({
    description: 'Concrete error type',
    default: FormError.NONE,
  })
  @IsOptional()
  @IsEnum(FormError)
  error?: FormError

  @ApiPropertyOptional({
    description: 'Data from ginis saved in our db',
    default: '<XML ...>',
  })
  @IsOptional()
  @IsString()
  formDataGinis?: string

  @ApiPropertyOptional({
    description: 'Ginis document id generated after registering the submission',
    default: 'MAG0X03RZC97',
  })
  @IsOptional()
  @IsString()
  ginisDocumentId?: string

  @Type(() => Date)
  @ApiPropertyOptional({
    description: 'Date time, when submission was finished in ginis',
    default: new Date(),
  })
  @IsOptional()
  @IsDate()
  finishSubmission?: Date

  @ApiPropertyOptional({
    description: 'ID of person, who is sending this (URI)',
    default: 'rc://8808070000/jozko_mrkvicka',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  senderId?: string

  @ApiPropertyOptional({
    description: 'ID of person, who is sending this (URI)',
    default: 'rc://8808070000/jozko_mrkvicka',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  recipientId?: string

  @ApiPropertyOptional({
    description:
      'User ID who submit this form, can be empty, if it was submitted by user through eID',
    default: 'e5c84a71-5985-40c7-bb19-e4ad22eda41c',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userCognitoID?: string

  @ApiPropertyOptional({
    description: 'Uri for defining electronic sendbox, if person has it',
    default: 'rc://sk/8808080000/jozko_mrkvicka',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  mainUri?: string | null

  @ApiPropertyOptional({
    description: 'Uri for defining electronic sendbox, if person has it',
    default: 'rc://sk/8808080000/jozko_mrkvicka',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  actorUri?: string | null

  @ApiPropertyOptional({
    description: 'Form summary for sent forms',
    nullable: true,
  })
  @IsObject()
  @IsOptional()
  formSummary?: PrismaJson.FormSummary

  @ApiPropertyOptional({
    description: 'JSON version of the form',
    example: '1.0',
  })
  @IsString()
  @IsOptional()
  jsonVersion?: string

  @ApiPropertyOptional({
    description: 'Form signature with metadata',
    type: FormSignatureDto,
    nullable: true,
  })
  @IsOptional()
  @Type(() => FormSignatureDto)
  @IsObject()
  @ValidateNested()
  formSignature?: FormSignatureDto

  @ApiPropertyOptional({
    description: 'Date time, when form was sent',
    nullable: true,
    example: '2026-02-11T12:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  formSentAt?: Date | null
}

export class UpdateFormRequestDto {
  // eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
  @ApiPropertyOptional({
    description: 'Send JSON body of form',
    default: {},
  })
  @IsOptional()
  formDataJson?: PrismaJson.FormDataJson

  @ApiPropertyOptional({
    description: 'Form signature with metadata',
    type: FormSignatureDto,
    nullable: true,
  })
  @IsOptional()
  @Type(() => FormSignatureDto)
  @IsObject()
  @ValidateNested()
  formSignature?: FormSignatureDto
}

export class GetFormsRequestDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: DEFAULT_PAGE,
  })
  @IsOptional()
  @IsNumberString()
  currentPage?: string

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @IsNumberString()
  pagination?: string

  @ApiPropertyOptional({
    description:
      'Forms in which states are searched - when omitted, all forms of the user are searched',
    example: [FormState.DRAFT, FormState.QUEUED],
    enumName: 'FormState',
    enum: FormState,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(FormState, { each: true })
  states?: FormState[]

  @ApiPropertyOptional({
    description: 'Get only forms in such a state, that user can still edit it.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  userCanEdit?: boolean

  @ApiPropertyOptional({
    description: 'Slug of the form definition',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
  })
  @IsString()
  @IsOptional()
  formDefinitionSlug?: string
}
