/* eslint-disable pii/no-phone-number */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FormError, FormState, Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  JSON_FORM_EXAMPLE,
} from '../../utils/constants'
import { ToBoolean } from '../../utils/decorators/request.decorator'

class JwtNasesPayloadActorDto {
  declare name: string

  declare sub: string
}

export class JwtNasesPayloadDto {
  declare sub: string

  declare exp: number

  declare nbf: number

  declare iat: number

  declare name: string

  declare actor: JwtNasesPayloadActorDto

  declare scopes: string[]

  declare jti: string
}

export class CreateFormRequestDto {
  @ApiProperty({
    description: 'Slug of the form definition',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
  })
  @IsNotEmpty()
  @IsString()
  declare formDefinitionSlug: string
}

export class UpdateFormRequestDto {
  // eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
  @ApiPropertyOptional({
    description: 'Send JSON body of form',
    default: {},
  })
  @IsOptional()
  formDataJson?: Prisma.JsonObject

  @ApiPropertyOptional({
    description: 'Signed ASiC-E container in Base64 format',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  formDataBase64?: string | null

  @ApiPropertyOptional({
    description: 'State of form ',
    default: FormState.DRAFT,
  })
  @IsOptional()
  @IsEnum(FormState)
  state?: FormState

  @ApiPropertyOptional({
    description: 'Data from ginis saved in our db',
    default: '<XML ...>',
  })
  @IsOptional()
  @IsString()
  formDataGinis?: string

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
  recipientId?: string

  @ApiPropertyOptional({
    description: 'Ginis document id generated after registering the submission',
    default: 'MAG0X03RZC97',
  })
  @IsOptional()
  @IsString()
  ginisDocumentId?: string
}

export class EidSendFormRequestDto {
  @ApiProperty({
    description: 'EID token to send form',
    example: '***',
  })
  @IsString()
  eidToken: string
}

export class EidUpdateSendFormRequestDto extends UpdateFormRequestDto {
  @ApiProperty({
    description: 'EID token to send form',
    example: '***',
  })
  @IsString()
  eidToken: string
}

export class GetFormResponseDto {
  /* For some reason, eslint-disable-next-line is not working here. */
  /* eslint-disable pii/no-email */
  @ApiProperty({
    description: 'Change email, on which you can be contacted',
    default: 'janko.mrkvicka@bratislava.sk',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  declare email: string | null
  /* eslint-enable pii/no-email */

  @ApiProperty({
    description: 'Id of record',
    default: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  declare id: string

  @Type(() => Date)
  @ApiProperty({
    description: 'Create date of record',
    default: new Date(),
  })
  @IsDefined()
  declare createdAt: Date

  @Type(() => Date)
  @ApiProperty({
    description: 'Update date of record',
    default: new Date(),
  })
  @IsDate()
  declare updatedAt: Date

  @ApiProperty({
    description: 'Id of send form from other system, (probably ginis)',
    default: '12345',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  declare externalId: string | null

  @ApiProperty({
    description:
      'User ID (from cognito) who submit this form, can be empty, if it was submitted by user through eID',
    default: 'e5c84a71-5985-40c7-bb19-e4ad22eda41c',
    nullable: true,
  })
  @IsOptional()
  declare userExternalId: string | null

  @ApiProperty({
    description: 'Uri for defining electronic sendbox, if person has it',
    default: 'rc://sk/8808080000/jozko_mrkvicka',
    nullable: true,
  })
  @IsOptional()
  declare mainUri: string | null

  @ApiProperty({
    description: 'Uri for defining electronic sendbox, if person has it',
    default: 'rc://sk/8808080000/jozko_mrkvicka',
    nullable: true,
  })
  @IsOptional()
  declare actorUri: string | null

  @ApiProperty({
    description: 'State of form',
    default: FormState.DRAFT,
    enum: FormState,
  })
  @IsEnum(FormState)
  declare state: string

  @ApiProperty({
    description: 'Specific error type',
    enum: FormError,
    default: FormError.NONE,
  })
  @IsEnum(FormError)
  declare error: string

  @ApiProperty({
    description: 'Data from ginis saved in our db',
    default: '<XML ...>',
    nullable: true,
  })
  @IsOptional()
  declare formDataGinis: string | null

  @ApiProperty({
    description: 'Ginis document id generated after registering the submission',
    default: 'MAG0X03RZC97',
  })
  @IsOptional()
  @IsString()
  declare ginisDocumentId: string | null

  @ApiProperty({
    description: 'Data in JSON format',
    example: JSON_FORM_EXAMPLE,
    nullable: true,
  })
  @IsOptional()
  declare formDataJson: Prisma.JsonValue | null

  @ApiPropertyOptional({
    description: 'Signed ASiC-E container in Base64 format',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  declare formDataBase64?: string | null

  @ApiProperty({
    description: 'Technical NASES id of sender',
    default: 'eba_1234',
    nullable: true,
  })
  @IsOptional()
  declare senderId: string | null

  @ApiProperty({
    description: 'Technical NASES id of recipient',
    default: 'eba_1234',
    nullable: true,
  })
  @IsOptional()
  declare recipientId: string | null

  @ApiProperty({
    description: 'end of submition',
    default: '2022-01-01 12:12:12',
    nullable: true,
  })
  @IsOptional()
  declare finishSubmission: Date | null

  @ApiProperty({
    description: 'Message subject created from uiSchema',
    example:
      'e-ZST ž. “Ulica” “Názov stavby / projektu”, pč “Parcelné číslo” kú “Katastrálne územie"',
  })
  @IsString()
  declare messageSubject: string

  @ApiProperty({
    description: 'Title used in frontend when listing forms',
    example: 'Názov stavby / projektu',
  })
  @IsString()
  declare frontendTitle: string

  @ApiProperty({
    description: 'Slug of the form definition',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
  })
  @IsNotEmpty()
  @IsString()
  declare formDefinitionSlug: string
}

export class GetFormResponseSimpleDto {
  @ApiProperty({
    description: 'Id of record',
    default: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  declare id: string

  @Type(() => Date)
  @ApiProperty({
    description: 'Create date of record',
    default: new Date(),
  })
  @IsDefined()
  declare createdAt: Date

  @Type(() => Date)
  @ApiProperty({
    description: 'Update date of record',
    default: new Date(),
  })
  @IsDate()
  declare updatedAt: Date

  @ApiProperty({
    description: 'State of form',
    default: FormState.DRAFT,
    enum: FormState,
  })
  @IsEnum(FormState)
  declare state: string

  @ApiProperty({
    description: 'Specific error type',
    enum: FormError,
    default: FormError.NONE,
  })
  @IsEnum(FormError)
  declare error: string

  @ApiProperty({
    description: 'Data in JSON format',
    example: JSON_FORM_EXAMPLE,
    nullable: true,
  })
  @IsOptional()
  declare formDataJson: Prisma.JsonValue | null

  @ApiProperty({
    description: 'Message subject created from uiSchema',
    example:
      'e-ZST ž. “Ulica” “Názov stavby / projektu”, pč “Parcelné číslo” kú “Katastrálne územie"',
  })
  @IsString()
  declare messageSubject: string

  @ApiProperty({
    description: 'Title used in frontend when listing forms',
    example: 'Názov stavby / projektu',
  })
  @IsString()
  declare frontendTitle: string

  @ApiProperty({
    description: 'Slug of the form definition',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
  })
  @IsNotEmpty()
  @IsString()
  declare formDefinitionSlug: string
}

class GetFormMetaDto {
  @ApiProperty({
    description: 'Number of forms for each state',
    example: {
      DRAFT: 10,
      ERROR: 2,
      QUEUED: 0,
    },
  })
  countByState!: Record<FormState, number>
}

export class GetFormsResponseDto {
  @ApiProperty({
    description: 'actual page',
    default: 1,
  })
  currentPage!: number

  @ApiProperty({
    description: 'number of items in one page',
    default: 100,
  })
  pagination!: number

  @ApiProperty({
    description: 'Total number of items',
    default: 100,
  })
  countPages!: number

  @ApiProperty({
    description: 'Items',
    type: [GetFormResponseSimpleDto],
  })
  items!: GetFormResponseSimpleDto[]

  @ApiProperty({
    description: 'Meta data',
    type: GetFormMetaDto,
  })
  meta!: GetFormMetaDto
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

export class SendFormResponseDto {
  @ApiProperty({
    description: 'Id of record',
    default: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  declare id: string

  @ApiProperty({
    description: 'Message response regarding the process',
    default: 'Form was sucessfully queued to rabbitmq.',
  })
  @IsString()
  declare message: string

  @ApiProperty({
    description: 'Form state',
    default: FormState.QUEUED,
  })
  @IsEnum(FormState)
  declare state: FormState
}
/* eslint-enable pii/no-phone-number */
