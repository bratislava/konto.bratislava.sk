import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FileStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export default class PostScanFileResponseDto {
  @ApiProperty({
    description: 'scan result',
    enum: FileStatus,
    example: FileStatus.ACCEPTED,
  })
  @IsEnum(FileStatus)
  declare status: FileStatus

  // id of the record in db
  @ApiProperty({
    description: 'id of the record in db',
    example: 'd81d6e01-8196-45a1-bce2-e02877d9fbd8',
  })
  @IsString()
  @IsOptional()
  declare id: string

  @ApiProperty({
    description: 'File name in minio',
    example: 'file name or file uid.pdf',
  })
  @IsString()
  declare minioFileName: string

  @ApiPropertyOptional({
    description: 'more info',
    example: 'file is queued for scanning',
  })
  @IsString()
  @IsOptional()
  declare message?: string
}

export class GetScanFileDto {
  @ApiProperty({
    description: 'uid/name of the file',
    example: 'ffsdfsd89796',
  })
  @IsString()
  minioFileName: string

  @ApiProperty({
    description: 'uid of the bucket',
    example: 'ffsdfsd89796',
  })
  @IsString()
  bucketUid: string

  @ApiPropertyOptional({
    description: 'uid of the user',
    example: 'ffsdfsd89796',
  })
  @IsString()
  @IsOptional()
  userUid?: string

  @ApiProperty({
    description: 'File size in bytes',
    example: '123131',
  })
  @IsNumber()
  fileSize: number

  @ApiProperty({
    description: 'File mime type of file',
    example: 'application/pdf',
  })
  @IsString()
  fileMimeType: string

  @ApiProperty({
    description: 'scan result',
    enum: FileStatus,
    example: FileStatus.ACCEPTED,
  })
  @IsEnum(FileStatus)
  status: FileStatus

  // eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
  @ApiPropertyOptional({
    description: 'other meta data',
    example: '{ "type": "TIE Fighter"}',
  })
  @IsOptional()
  meta?: Record<string, object>

  // api property for created at
  @Type(() => Date)
  @ApiProperty({
    description: 'created at',
    example: '2021-05-05T12:00:00.000Z',
  })
  @IsDate()
  createdAt: Date

  // api property for updated at
  @Type(() => Date)
  @ApiProperty({
    description: 'updated at',
    example: '2021-05-05T12:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date
}
