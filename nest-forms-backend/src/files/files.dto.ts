/* eslint-disable pii/no-phone-number */
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger'
import { Files, FileStatus, FormError, FormState } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class processFileResulDto {
  declare result: boolean

  declare file: Files
}

class formUserInformationDto {
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
}

class idDto {
  @ApiProperty({
    description: 'id of the record in db',
    example: 'd81d6e01-8196-45a1-bce2-e02877d9fbd8',
  })
  @IsUUID()
  @IsString()
  declare id: string
}

export class DownloadTokenResponseDataDto {
  @ApiProperty({
    description: 'Download jwt token',
    // eslint-disable-next-line no-secrets/no-secrets
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  })
  @IsString()
  declare jwt: string
}

export class FileIdDto {
  @ApiProperty({
    description: 'Desired id of file in db',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsOptional()
  @IsUUID()
  declare fileId: string
}

export class FileNameDto {
  @ApiProperty({
    description: 'Real file name of the file, but is used only for display',
    example: 'invoice.pdf',
  })
  @IsString()
  declare fileName: string
}

export class FileSizeDto {
  @ApiProperty({
    description: 'File size in bytes',
    example: 83_023_423,
  })
  @IsNumber()
  declare fileSize: number
}

export class FormInfo {
  @ApiProperty({
    description: 'Type of form',
    example: 'esmao.eforms.bratislava.object_082',
  })
  @IsString()
  declare pospIdOrSlug: string

  @ApiProperty({
    description: 'Form record id',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  declare formId: string

  @ApiPropertyOptional({
    description: 'External Id of user',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  declare userExternalId?: string | null
}

/* file models */
export class StatusFileDto {
  @ApiProperty({
    description: 'scan result',
    enum: FileStatus,
    example: FileStatus.ACCEPTED,
  })
  @IsEnum(FileStatus)
  declare status: FileStatus
}

export class GinisOrderFileDto {
  @ApiProperty({
    description: 'order of this file in respective ginis submission',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  declare ginisOrder: number | null

  @ApiProperty({
    description: 'If the file was uploaded to GINIS',
    example: false,
  })
  @IsBoolean()
  declare ginisUploaded: boolean
}

export class BasicFileDto extends FileNameDto {
  @ApiProperty({
    description: 'Name under which is file stored in minio',
    example: 'd81d6e01-8196-45a1-bce2-e02877d9fbd8.pdf',
  })
  @IsString()
  declare minioFileName: string

  @ApiProperty({
    description: 'Form type',
    example: 'esmao.eforms.bratislava.obec_082',
  })
  @IsString()
  declare pospId: string

  @ApiProperty({
    description: 'Identifier of sent form',
    example: 'f69559da-5eca-4ed7-80fd-370d09dc3632',
  })
  @IsUUID()
  @IsString()
  declare formId: string
}

export class BasicFileWithStatusDto extends IntersectionType(
  StatusFileDto,
  BasicFileDto,
  FileSizeDto,
) {}

export class UserFileWithFileIdDto extends IntersectionType(
  BasicFileDto,
  FileIdDto,
  FileSizeDto,
) {}

export class BasicFileWithStatus extends IntersectionType(
  BasicFileDto,
  BasicFileWithStatusDto,
  FileSizeDto,
  GinisOrderFileDto,
) {}

export class ExtendedFileDto extends BasicFileWithStatus {
  // id of the record in db
  @ApiProperty({
    description: 'id of the record in db',
    example: 'd81d6e01-8196-45a1-bce2-e02877d9fbd8',
  })
  @IsUUID()
  @IsString()
  declare id: string

  @ApiPropertyOptional({
    description: 'File id under which is file stored in the scanner',
    example: 'd81d6e01-8196-45a1-bce2-e02877d9fbd8',
    nullable: true,
  })
  @IsUUID()
  @IsString()
  @IsOptional()
  scannerId?: string | null

  // createdAt
  @Type(() => Date)
  @ApiProperty({
    description: 'Date when file was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsDate()
  declare createdAt: Date

  // updatedAt
  @Type(() => Date)
  @ApiProperty({
    description: 'Date when file was updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsDate()
  declare updatedAt: Date

  @Type(() => formUserInformationDto)
  @ApiPropertyOptional({
    description: 'Info about user who sent the form',
  })
  @IsOptional()
  declare forms?: formUserInformationDto
}

export class ResponseFileDto extends ExtendedFileDto {
  @ApiProperty({
    description: 'more info',
    example: 'file is queued for scanning',
  })
  @IsString()
  declare message: string
}

export class ResponseBasicFileDto extends BasicFileWithStatusDto {
  @ApiProperty({
    description: 'more info',
    example: 'file is deleted',
  })
  @IsString()
  declare message: string
}

/* Requests and responses */
export class PostFileRequestDto extends IntersectionType(
  BasicFileDto,
  FileIdDto,
  FileSizeDto,
) {}

export class PostFileResponseDto extends ExtendedFileDto {}

export class GetFileStatusResponseDto extends StatusFileDto {}

export class GetFileResponseDto extends IntersectionType(ExtendedFileDto) {}

export class GetFileResponseReducedDto extends IntersectionType(
  idDto,
  FileNameDto,
  FileSizeDto,
  StatusFileDto,
  GinisOrderFileDto,
) {}

export class UpdateFileStatusRequestDto extends StatusFileDto {}

export class UpdateFileStatusResponseDto extends ResponseFileDto {}

export class DeleteFileResponseData extends idDto {
  @ApiProperty({
    description: 'more info',
    example: 'file is deleted',
  })
  @IsString()
  declare message: string
}

/* file upload */

export interface BufferedFileDto {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer | string
}

export class FormDataFileDto {
  @IsString()
  declare filename: string

  @IsUUID()
  declare id: string
}

export class FormFilesReadyResultDto {
  filesReady: boolean

  requeue: boolean

  state?: FormState

  error?: FormError
}

export class FormFilesWithMinio {
  minioPath: string

  fileName: string

  id: string
}
/* eslint-enable pii/no-phone-number */
