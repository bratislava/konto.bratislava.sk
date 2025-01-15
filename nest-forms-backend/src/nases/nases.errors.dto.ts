import { ApiProperty } from '@nestjs/swagger'

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
