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

export class NoFormXmlDataErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.NO_FORM_XML_DATA_ERROR,
    default: FormsErrorsEnum.NO_FORM_XML_DATA_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.NO_FORM_XML_DATA_ERROR,
    default: FormsErrorsResponseEnum.NO_FORM_XML_DATA_ERROR,
  })
  declare message: string
}

export class FormNotEditableErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
    default: FormsErrorsEnum.FORM_NOT_EDITABLE_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR,
    default: FormsErrorsResponseEnum.FORM_NOT_EDITABLE_ERROR,
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

export class FormDefinitionNotFoundErrorDto extends NotFoundErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
    default: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
    default: FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
  })
  declare message: string
}

export class FormDefinitionNotSupportedTypeErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
    default: FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
    default: FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
  })
  declare message: string
}

export class EmptyFormDataErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FormsErrorsEnum.EMPTY_FORM_DATA,
    default: FormsErrorsEnum.EMPTY_FORM_DATA,
  })
  declare errorName: string

  @ApiProperty({
    example: FormsErrorsResponseEnum.EMPTY_FORM_DATA,
    default: FormsErrorsResponseEnum.EMPTY_FORM_DATA,
  })
  declare message: string
}
