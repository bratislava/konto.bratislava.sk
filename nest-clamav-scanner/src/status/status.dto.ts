import { ApiProperty } from '@nestjs/swagger';

//dto for clamav version.
export class MinioVersionDto {
  @ApiProperty({
    description: 'minio version',
    example: '0.102.4',
  })
  version: string;
}

export class ServiceRunningDto {
  @ApiProperty({
    description: 'is service running?',
    example: 'true',
  })
  running: boolean;
}

//dto for clamav version.
export class ClamavVersionDto {
  @ApiProperty({
    description: 'clamav version',
    example: '1.4.2',
  })
  version: string;
}

//dto for all statuses
export class ServicesStatusDto {
  @ApiProperty({ type: ServiceRunningDto })
  prisma: ServiceRunningDto;

  @ApiProperty({ type: ServiceRunningDto })
  minio: ServiceRunningDto;

  @ApiProperty({ type: ServiceRunningDto })
  forms: ServiceRunningDto;

  @ApiProperty({ type: ServiceRunningDto })
  clamav: ServiceRunningDto;

  @ApiProperty({ type: ClamavVersionDto })
  clamavVersion: ClamavVersionDto;
}
