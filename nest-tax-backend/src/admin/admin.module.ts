import { Module } from '@nestjs/common'

import { AdminStrategy } from '../auth/strategies/admin.strategy'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import ClientsModule from '../clients/clients.module'
import { NorisModule } from '../noris/noris.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  imports: [BloomreachModule, NorisModule, ClientsModule],
  providers: [
    AdminService,
    AdminStrategy,
    QrCodeSubservice,
    CityAccountSubservice,
    ThrowerErrorGuard,
  ],
  exports: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
