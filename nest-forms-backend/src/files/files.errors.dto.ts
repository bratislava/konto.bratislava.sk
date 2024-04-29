import { ApiProperty } from '@nestjs/swagger'

import {
  BadRequestErrorDto,
  ForbiddenErrorDto,
  InternalServerErrorDto,
  NotAcceptedErrorDto,
  NotFoundErrorDto,
  UnprocessableEntityErrorDto,
} from '../utils/global-dtos/errors.dto'
import { FilesErrorsEnum, FilesErrorsResponseEnum } from './files.errors.enum'

export class FileNotFoundErrorDto extends NotFoundErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_NOT_FOUND_ERROR,
    default: FilesErrorsEnum.FILE_NOT_FOUND_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_NOT_FOUND_ERROR,
    default: FilesErrorsResponseEnum.FILE_NOT_FOUND_ERROR,
  })
  declare message: string
}

export class FileWrongStatusNotAcceptedErrorDto extends NotAcceptedErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
    default: FilesErrorsEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
    default: FilesErrorsResponseEnum.FILE_WRONG_STATUS_NOT_ACCEPTED_ERROR,
  })
  declare message: string
}

export class FileByScannerIdNotFoundErrorDto extends NotAcceptedErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_BY_SCANNERID_NOT_FOUND_ERROR,
    default: FilesErrorsEnum.FILE_BY_SCANNERID_NOT_FOUND_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_BY_SCANNERID_NOT_FOUND_ERROR,
    default: FilesErrorsResponseEnum.FILE_BY_SCANNERID_NOT_FOUND_ERROR,
  })
  declare message: string
}

export class NoFileUploadDataErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.NO_FILE_UPLOAD_DATA_ERROR,
    default: FilesErrorsEnum.NO_FILE_UPLOAD_DATA_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.NO_FILE_UPLOAD_DATA_ERROR,
    default: FilesErrorsResponseEnum.NO_FILE_UPLOAD_DATA_ERROR,
  })
  declare message: string
}

export class FileIdAlreadyExistsErrorDto extends NotAcceptedErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_ID_ALREADY_EXISTS_ERROR,
    default: FilesErrorsEnum.FILE_ID_ALREADY_EXISTS_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_ID_ALREADY_EXISTS_ERROR,
    default: FilesErrorsResponseEnum.FILE_ID_ALREADY_EXISTS_ERROR,
  })
  declare message: string
}

export class FileHasUnsupportedMimeTypeErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR,
    default: FilesErrorsEnum.FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR,
    default: FilesErrorsResponseEnum.FILE_MIME_TYPE_IS_NOT_SUPPORTED_ERROR,
  })
  declare message: string
}

export class FileSizeExceededErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_SIZE_EXCEEDED_ERROR,
    default: FilesErrorsEnum.FILE_SIZE_EXCEEDED_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_SIZE_EXCEEDED_ERROR,
    default: FilesErrorsResponseEnum.FILE_SIZE_EXCEEDED_ERROR,
  })
  declare message: string
}

export class FileSizeZeroErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_SIZE_ZERO_ERROR,
    default: FilesErrorsEnum.FILE_SIZE_ZERO_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_SIZE_ZERO_ERROR,
    default: FilesErrorsResponseEnum.FILE_SIZE_ZERO_ERROR,
  })
  declare message: string
}

export class InvalidJwtTokenErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.INVALID_JWT_TOKEN_ERROR,
    default: FilesErrorsEnum.INVALID_JWT_TOKEN_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.INVALID_JWT_TOKEN_ERROR,
    default: FilesErrorsResponseEnum.INVALID_JWT_TOKEN_ERROR,
  })
  declare message: string
}

export class NoFileIdInJwtErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.NO_FILE_ID_IN_JWT_TOKEN_ERROR,
    default: FilesErrorsEnum.NO_FILE_ID_IN_JWT_TOKEN_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.NO_FILE_ID_IN_JWT_TOKEN_ERROR,
    default: FilesErrorsResponseEnum.NO_FILE_ID_IN_JWT_TOKEN_ERROR,
  })
  declare message: string
}

export class InvalidOrExpiredJwtTokenErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.INVALID_OR_EXPIRED_JWT_TOKEN_ERROR,
    default: FilesErrorsEnum.INVALID_OR_EXPIRED_JWT_TOKEN_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.INVALID_OR_EXPIRED_JWT_TOKEN_ERROR,
    default: FilesErrorsResponseEnum.INVALID_OR_EXPIRED_JWT_TOKEN_ERROR,
  })
  declare message: string
}

export class ScannerNoResponseErrorDto extends InternalServerErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.SCANNER_NO_RESPONSE_ERROR,
    default: FilesErrorsEnum.SCANNER_NO_RESPONSE_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.SCANNER_NO_RESPONSE_ERROR,
    default: FilesErrorsResponseEnum.SCANNER_NO_RESPONSE_ERROR,
  })
  declare message: string
}

export class FileIsOwnedBySomeoneElseErrorDto extends ForbiddenErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
    default: FilesErrorsEnum.FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
    default: FilesErrorsResponseEnum.FILE_IS_OWNED_BY_SOMEONE_ELSE_ERROR,
  })
  declare message: string
}

export class FileUploadToMinioWasNotSuccessfulErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
    default: FilesErrorsEnum.FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example:
      FilesErrorsResponseEnum.FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
    default:
      FilesErrorsResponseEnum.FILE_UPLOAD_TO_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
  })
  declare message: string
}

export class FileDeleteFromMinioWasNotSuccessfulErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
    default: FilesErrorsEnum.FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example:
      FilesErrorsResponseEnum.FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
    default:
      FilesErrorsResponseEnum.FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR,
  })
  declare message: string
}

export class FileIdsNotFoundInDbErrorDto extends UnprocessableEntityErrorDto {
  @ApiProperty({
    example: FilesErrorsEnum.FILE_IDS_NOT_FOUND_IN_DB_ERROR,
    default: FilesErrorsEnum.FILE_IDS_NOT_FOUND_IN_DB_ERROR,
  })
  declare errorName: string

  @ApiProperty({
    example: FilesErrorsResponseEnum.FILE_IDS_NOT_FOUND_IN_DB_ERROR,
    default: FilesErrorsResponseEnum.FILE_IDS_NOT_FOUND_IN_DB_ERROR,
  })
  declare message: string
}
