import { ApiProperty } from '@nestjs/swagger'

export class MinioVersionDto {
  @ApiProperty({
    description: 'minio version',
    example: '0.102.4',
  })
  declare version: string
}

export class ServiceRunningDto {
  @ApiProperty({
    description: 'is service running?',
    example: 'true',
  })
  declare running: boolean
}
