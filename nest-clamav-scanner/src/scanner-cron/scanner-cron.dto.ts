import { FileStatus } from '../generated/prisma/client'

export class UpdateScanStatusDto {
  status: FileStatus
  notified: boolean
  runs?: number
}
