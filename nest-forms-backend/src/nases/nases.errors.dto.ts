import { ApiProperty } from '@nestjs/swagger'
import { VerifyFormSignatureErrorType } from 'forms-shared/signer/signature'

import {
  ForbiddenErrorDto,
  InternalServerErrorDto,
  UnprocessableEntityErrorDto,
} from '../utils/global-dtos/errors.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from './nases.errors.enum'

export class UnableAddFormToRabbitErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
    default: NasesErrorsEnum.UNABLE_ADD_FORM_TO_RABBIT,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.UNABLE_ADD_FORM_TO_RABBIT,
    default: NasesErrorsResponseEnum.UNABLE_ADD_FORM_TO_RABBIT,
  })
  declare message: string
}

export class ForbiddenFormSendDto extends ForbiddenErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.FORBIDDEN_SEND,
    default: NasesErrorsEnum.FORBIDDEN_SEND,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.FORBIDDEN_SEND,
    default: NasesErrorsResponseEnum.FORBIDDEN_SEND,
  })
  declare message: string
}

export class FormAssignedToOtherUserErrorDto extends ForbiddenErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.FORM_ASSIGNED_TO_OTHER_USER,
    default: NasesErrorsEnum.FORM_ASSIGNED_TO_OTHER_USER,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.FORM_ASSIGNED_TO_OTHER_USER,
    default: NasesErrorsResponseEnum.FORM_ASSIGNED_TO_OTHER_USER,
  })
  declare message: string
}

export class FormSummaryGenerationErrorDto extends InternalServerErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.FORM_SUMMARY_GENERATION_ERROR,
    default: NasesErrorsEnum.FORM_SUMMARY_GENERATION_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.FORM_SUMMARY_GENERATION_ERROR,
    default: NasesErrorsResponseEnum.FORM_SUMMARY_GENERATION_ERROR,
  })
  declare message: string
}

export class SignatureMissingErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.SIGNATURE_MISSING,
    default: NasesErrorsEnum.SIGNATURE_MISSING,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.SIGNATURE_MISSING,
    default: NasesErrorsResponseEnum.SIGNATURE_MISSING,
  })
  declare message: string
}

export class SignatureFormDefinitionMismatchErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
    default: NasesErrorsEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
    default: NasesErrorsResponseEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
  })
  declare message: string
}

export class SignatureFormDataHashMismatchErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
    default: NasesErrorsEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
    default: NasesErrorsResponseEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
  })
  declare message: string
}

export class FormVersionNotCompatibleErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: NasesErrorsEnum.FORM_VERSION_NOT_COMPATIBLE,
    default: NasesErrorsEnum.FORM_VERSION_NOT_COMPATIBLE,
  })
  declare errorName: string

  @ApiProperty({
    example: NasesErrorsResponseEnum.FORM_VERSION_NOT_COMPATIBLE,
    default: NasesErrorsResponseEnum.FORM_VERSION_NOT_COMPATIBLE,
  })
  declare message: string
}

export const verifyFormSignatureErrorMapping: Record<
  VerifyFormSignatureErrorType,
  { error: NasesErrorsEnum; message: NasesErrorsResponseEnum }
> = {
  [VerifyFormSignatureErrorType.FormDefinitionMismatch]: {
    error: NasesErrorsEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
    message: NasesErrorsResponseEnum.SIGNATURE_FORM_DEFINITION_MISMATCH,
  },
  [VerifyFormSignatureErrorType.FormDataHashMismatch]: {
    error: NasesErrorsEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
    message: NasesErrorsResponseEnum.SIGNATURE_FORM_DATA_HASH_MISMATCH,
  },
}
