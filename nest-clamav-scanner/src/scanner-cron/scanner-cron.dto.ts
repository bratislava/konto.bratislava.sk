import { FileStatus } from '@prisma/client';

export class UpdateScanStatusDto {
  status: FileStatus;
  notified: boolean;
  runs?: number;
}
