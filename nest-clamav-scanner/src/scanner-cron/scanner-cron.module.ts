import { Module } from '@nestjs/common'

import { ClamavClientModule } from '../clamav-client/clamav-client.module'
import { FormsClientModule } from '../forms-client/forms-client.module'
import { MinioClientModule } from '../minio-client/minio-client.module'
import { ScannerModule } from '../scanner/scanner.module'
import { ScannerCronService } from './scanner-cron.service'

@Module({
  providers: [ScannerCronService],
  imports: [
    ScannerModule,
    MinioClientModule,
    ClamavClientModule,
    FormsClientModule,
  ],
})
export class ScannerCronModule {}
