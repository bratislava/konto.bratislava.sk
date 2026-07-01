import { Module } from '@nestjs/common'

import { BasicGuard } from '../auth/guards/auth-basic.guard'
import { ClamavClientModule } from '../clamav-client/clamav-client.module'
import { MinioClientModule } from '../minio-client/minio-client.module'
import { PrismaModule } from '../prisma/prisma.module'
import { ScannerController } from './scanner.controller'
import { ScannerService } from './scanner.service'

@Module({
  imports: [PrismaModule, MinioClientModule, ClamavClientModule],
  controllers: [ScannerController],
  providers: [ScannerService, BasicGuard],
  exports: [ScannerService],
})
export class ScannerModule {}
