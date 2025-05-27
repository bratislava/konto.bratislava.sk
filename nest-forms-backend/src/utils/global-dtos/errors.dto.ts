import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { ErrorsEnum, ErrorsResponseEnum } from '../global-enums/errors.enum'

export class BaseErrorDto {
  @ApiProperty({
    description: 'Status Code',
    example: 500,
  })
  declare statusCode: number

  @ApiProperty({
    description: 'Detail error message',
    example: ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
  })
  declare message: string
}

export class SimpleBadRequestErrorDto extends BaseErrorDto {
  @ApiProperty({
    default: 400,
    example: 400,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Bad Request',
    example: 'Bad Request',
  })
  declare message: string
}

export class BadRequestDecoratorErrorDto {
  @ApiProperty({
    default: 400,
    example: 400,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'filename is not filled',
    example: 'filename is not filled',
  })
  declare message: string[]

  @ApiProperty({
    default: 'Bad Request',
    example: 'Bad Request',
  })
  declare error: string
}

export class UnauthorizedErrorDto extends BaseErrorDto {
  @ApiProperty({
    default: 401,
    example: 401,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Unauthorized',
    example: 'Unauthorized',
  })
  declare message: string
}

export class GlobalErrorDto extends BaseErrorDto {
  @ApiProperty({
    description: 'status in text',
    example: 'Server Error',
  })
  declare status: string

  @ApiProperty({
    description: 'Exact error name',
    example: ErrorsEnum.NOT_FOUND_ERROR,
    enum: ErrorsEnum,
  })
  declare errorName: string

  @ApiPropertyOptional({
    description: 'Helper for sending additional data in error',
    default: null,
  })
  object?: object
}

export class BadRequestErrorDto extends GlobalErrorDto {
  @ApiProperty({
    default: 400,
    example: 400,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Bad request',
    example: 'Bad request',
  })
  declare status: string
}

export class ForbiddenErrorDto extends GlobalErrorDto {
  @ApiProperty({
    default: 403,
    example: 403,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Forbidden',
    example: 'Forbidden',
  })
  declare status: string
}

export class NotFoundErrorDto extends GlobalErrorDto {
  @ApiProperty({
    example: 404,
    default: 404,
  })
  declare statusCode: number

  @ApiProperty({
    example: 'Not found',
    default: 'Not found',
  })
  declare status: string
}

export class NotAcceptedErrorDto extends GlobalErrorDto {
  @ApiProperty({
    example: 406,
    default: 406,
  })
  declare statusCode: number

  @ApiProperty({
    example: 'Not accepted',
    default: 'Not accepted',
  })
  declare status: string
}

export class GoneErrorDto extends GlobalErrorDto {
  @ApiProperty({
    default: 410,
    example: 410,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Resource was processed',
    example: 'Resource was processed',
  })
  declare status: string
}

export class PayloadTooLargeErrorDto extends GlobalErrorDto {
  @ApiProperty({
    default: 413,
    example: 413,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Payload too large error',
    example: 'Payload too large error',
  })
  declare status: string
}

export class UnprocessableEntityErrorDto extends GlobalErrorDto {
  @ApiProperty({
    default: 422,
    example: 422,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Unprocessable entity error',
    example: 'Unprocessable entity error',
  })
  declare status: string
}

export class InternalServerErrorDto extends GlobalErrorDto {
  @ApiProperty({
    default: 500,
    example: 500,
  })
  declare statusCode: number

  @ApiProperty({
    default: 'Internal server error',
    example: 'Internal server error',
  })
  declare status: string
}

export class DatabaseErrorDto extends InternalServerErrorDto {
  @ApiProperty({
    example: ErrorsEnum.DATABASE_ERROR,
    default: ErrorsEnum.DATABASE_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: ErrorsResponseEnum.DATABASE_ERROR,
    default: ErrorsResponseEnum.DATABASE_ERROR,
  })
  declare message: string
}
