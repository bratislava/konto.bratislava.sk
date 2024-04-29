import { ApiProperty } from '@nestjs/swagger'

import {
  BadRequestErrorDto,
  GoneErrorDto,
  NotFoundErrorDto,
  PayloadTooLargeErrorDto,
} from '../utils/global-dtos/errors.dto'
import {
  ScannerClientErrorsEnum,
  ScannerClientResponseEnum,
} from './scanner-client.errors.enum'

export class FileInScannerNotFoundErrorDto extends NotFoundErrorDto {
  @ApiProperty({
    example: ScannerClientErrorsEnum.FILE_IN_SCANNER_NOT_FOUND,
    default: ScannerClientErrorsEnum.FILE_IN_SCANNER_NOT_FOUND,
  })
  declare errorName: string

  @ApiProperty({
    example: ScannerClientResponseEnum.FILE_IN_SCANNER_NOT_FOUND,
    default: ScannerClientResponseEnum.FILE_IN_SCANNER_NOT_FOUND,
  })
  declare message: string
}

export class FileSizeTooLargeErrorDto extends PayloadTooLargeErrorDto {
  @ApiProperty({
    example: ScannerClientErrorsEnum.FILE_SIZE_TOO_LARRGE,
    default: ScannerClientErrorsEnum.FILE_SIZE_TOO_LARRGE,
  })
  declare errorName: string

  @ApiProperty({
    example: ScannerClientResponseEnum.FILE_SIZE_TOO_LARRGE,
    default: ScannerClientResponseEnum.FILE_SIZE_TOO_LARRGE,
  })
  declare message: string
}

export class FileAlreadyProcessedErrorDto extends GoneErrorDto {
  @ApiProperty({
    example: ScannerClientErrorsEnum.FILE_WAS_PROCESSED,
    default: ScannerClientErrorsEnum.FILE_WAS_PROCESSED,
  })
  declare errorName: string

  @ApiProperty({
    example: ScannerClientResponseEnum.FILE_WAS_PROCESSED,
    default: ScannerClientResponseEnum.FILE_WAS_PROCESSED,
  })
  declare message: string
}

export class FileWrongParamsErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ScannerClientErrorsEnum.FILE_HAS_WRONG_PARAMETERS,
    default: ScannerClientErrorsEnum.FILE_HAS_WRONG_PARAMETERS,
  })
  declare errorName: string

  @ApiProperty({
    example: ScannerClientResponseEnum.FILE_HAS_WRONG_PARAMETERS,
    default: ScannerClientResponseEnum.FILE_HAS_WRONG_PARAMETERS,
  })
  declare message: string
}

export class ProblemWithScannerErrorDto extends BadRequestErrorDto {
  @ApiProperty({
    example: ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
    default: ScannerClientErrorsEnum.PROBLEM_WITH_SCANNER,
  })
  declare errorName: string

  @ApiProperty({
    example: ScannerClientResponseEnum.PROBLEM_WITH_SCANNER,
    default: ScannerClientResponseEnum.PROBLEM_WITH_SCANNER,
  })
  declare message: string
}
