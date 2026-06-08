import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FormError, FormState } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'

import { JSON_FORM_EXAMPLE } from '../../utils/constants'
import { FormSignatureDto } from './requests.dto'

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

export class BumpJsonVersionResponseDto {
  @ApiProperty({
    description: 'UUID of the form.',
    example: 'e5c84a71-5985-40c7-bb19-e4ad22eda41c',
  })
  formId: string

  @ApiProperty({
    description: 'True if the form was successfully bumped.',
    example: true,
  })
  success: boolean
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
  declare formDataJson: PrismaJson.FormDataJson | null

  @ApiProperty({
    description: 'Form subject',
  })
  @IsString()
  declare formSubject: string

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

export class UpdateFormResponseDto {
  @ApiProperty({
    description: 'Change email, on which you can be contacted',
    default: 'janko.mrkvicka@bratislava.sk',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  declare email: string | null

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
  declare formDataJson: PrismaJson.FormDataJson | null

  @ApiPropertyOptional({
    description: 'Form signature with metadata',
    type: FormSignatureDto,
    nullable: true,
  })
  @IsOptional()
  @Type(() => FormSignatureDto)
  @IsObject()
  @ValidateNested()
  formSignature?: FormSignatureDto | null

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
    description: 'Slug of the form definition',
    example: 'zavazne-stanovisko-k-investicnej-cinnosti',
  })
  @IsNotEmpty()
  @IsString()
  declare formDefinitionSlug: string

  @ApiProperty({
    description: 'JSON version',
    example: '1.0.0',
  })
  @IsNotEmpty()
  @IsString()
  declare jsonVersion: string
}

export class GetFormResponseDto extends UpdateFormResponseDto {
  @ApiProperty({
    description: 'Form subject',
  })
  @IsString()
  declare formSubject: string

  @ApiProperty()
  @IsBoolean()
  declare requiresMigration: boolean
}
