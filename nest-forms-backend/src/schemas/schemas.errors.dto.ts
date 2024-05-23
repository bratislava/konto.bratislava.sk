import { ApiProperty } from '@nestjs/swagger'

import { NotFoundErrorDto } from '../utils/global-dtos/errors.dto'
import {
  SchemasErrorsEnum,
  SchemasErrorsResponseEnum,
} from './schemas.errors.enum'

export class SchemaNotFoundDto extends NotFoundErrorDto {
  @ApiProperty({
    example: SchemasErrorsEnum.SCHEMA_NOT_FOUND,
    default: SchemasErrorsEnum.SCHEMA_NOT_FOUND,
  })
  declare errorName: string

  @ApiProperty({
    example: SchemasErrorsResponseEnum.SCHEMA_NOT_FOUND,
    default: SchemasErrorsResponseEnum.SCHEMA_NOT_FOUND,
  })
  declare message: string
}

export class SchemaVersionNotFoundDto extends NotFoundErrorDto {
  @ApiProperty({
    example: SchemasErrorsEnum.SCHEMA_VERSION_NOT_FOUND,
    default: SchemasErrorsEnum.SCHEMA_VERSION_NOT_FOUND,
  })
  declare errorName: string

  @ApiProperty({
    example: SchemasErrorsResponseEnum.SCHEMA_VERSION_NOT_FOUND,
    default: SchemasErrorsResponseEnum.SCHEMA_VERSION_NOT_FOUND,
  })
  declare message: string
}
