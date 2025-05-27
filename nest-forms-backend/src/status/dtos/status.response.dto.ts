import { ServiceRunningDto } from './status.dto'

export default class StatusResponseDto {
  prisma: ServiceRunningDto

  minio: ServiceRunningDto

  scanner: ServiceRunningDto
}
