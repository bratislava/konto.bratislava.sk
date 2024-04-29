import { ApiProperty } from '@nestjs/swagger'

import {
  ForbiddenErrorDto,
  NotAcceptedErrorDto,
  NotFoundErrorDto,
  UnprocessableEntityErrorDto,
} from '../utils/global-dtos/errors.dto'
import { FormsErrorsEnum, FormsErrorsResponseEnum } from './forms.errors.enum'

export class FormNotFoundErrorDto extends NotFoundErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
    default: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
    default: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
  })
  declare message: string
}

export class FormOrUserNotFoundErrorDto extends NotFoundErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_OR_USER_NOT_FOUND_ERROR,
    default: FormsErrorsEnum.FORM_OR_USER_NOT_FOUND_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_OR_USER_NOT_FOUND_ERROR,
    default: FormsErrorsResponseEnum.FORM_OR_USER_NOT_FOUND_ERROR,
  })
  declare message: string
}

export class FormNotDraftErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_NOT_DRAFT_ERROR,
    default: FormsErrorsEnum.FORM_NOT_DRAFT_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_NOT_DRAFT_ERROR,
    default: FormsErrorsResponseEnum.FORM_NOT_DRAFT_ERROR,
  })
  declare message: string
}

export class FormIsOwnedBySomeoneElseErrorDto extends ForbiddenErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
    default: FormsErrorsEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
    default: FormsErrorsResponseEnum.FORM_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
  })
  declare message: string
}

export class FormDataInvalidErrorDto extends NotAcceptedErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_DATA_INVALID,
    default: FormsErrorsEnum.FORM_DATA_INVALID,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_DATA_INVALID,
    default: FormsErrorsResponseEnum.FORM_DATA_INVALID,
  })
  declare message: string
}
