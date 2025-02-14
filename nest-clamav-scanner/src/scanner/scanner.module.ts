import { Module } from '@nestjs/common';
import { BasicGuard } from 'src/auth/guards/auth-basic.guard';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

import { ClamavClientModule } from '../clamav-client/clamav-client.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';

@Module({
  imports: [PrismaModule, MinioClientModule, ClamavClientModule],
  controllers: [ScannerController],
  providers: [ScannerService, BasicGuard],
  exports: [ScannerService],
})
export class ScannerModule {}
