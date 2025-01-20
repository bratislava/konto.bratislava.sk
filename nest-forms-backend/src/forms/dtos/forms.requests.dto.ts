/* eslint-disable pii/no-phone-number */
/* eslint-disable pii/no-email */

import { ApiPropertyOptional } from '@nestjs/swagger'
import { FormError, FormOwnerType, FormState, Prisma } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class FormCreateBodyDto {
  @ApiPropertyOptional({
    description:
      'User ID who submit this form, can be empty, if it was submitted by user through eID',
    default: 'e5c84a71-5985-40c7-bb19-e4ad22eda41c',
  })
  @IsOptional()
  @IsUUID()
  userCognitoID?: string

  @ApiPropertyOptional({
    description: 'Email, must not be empty',
    default: 'inovacie@bratislava.sk',
    nullable: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: string | null

  @ApiPropertyOptional({
    description: 'ID of person, who is sending this (URI)',
    default: 'rc://8808070000/jozko_mrkvicka',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  senderId?: string

  @ApiPropertyOptional({
    description: 'Type of owner (FO/PO)',
    example: FormOwnerType.FO,
  })
  @IsOptional()
  @IsEnum(FormOwnerType)
  ownerType?: FormOwnerType
}

export class FormUpdateBodyDto {
  // eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
  @ApiPropertyOptional({
    description: 'Send JSON body of form',
    default: {},
    nullable: true,
  })
  @IsOptional()
  formDataJson?: Prisma.JsonObject

  @ApiPropertyOptional({
    description: 'State of form ',
    default: FormState.DRAFT,
  })
  @IsOptional()
  @IsEnum(FormState)
  state?: FormState

  @ApiPropertyOptional({
    description: 'Concrete error type',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  @IsUUID()
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
  formSummary?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue

  @ApiPropertyOptional({
    description: 'JSON version of the form',
    example: '1.0',
  })
  @IsString()
  @IsOptional()
  jsonVersion?: string
}

/* eslint-enable pii/no-phone-number */
/* eslint-enable pii/no-email */
