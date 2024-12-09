import { Module } from '@nestjs/common'
import { AdminStrategy } from 'src/auth/strategies/admin.strategy'
import { BloomreachModule } from 'src/bloomreach/bloomreach.module'
import { NorisModule } from 'src/noris/noris.module'
import { CityAccountSubservice } from 'src/utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from 'src/utils/subservices/qrcode.subservice'

import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  imports: [BloomreachModule, NorisModule],
  providers: [
    AdminService,
    AdminStrategy,
    QrCodeSubservice,
    CityAccountSubservice,
  ],
  exports: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
