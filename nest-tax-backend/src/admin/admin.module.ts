import { Module } from '@nestjs/common'

import { AdminStrategy } from '../auth/strategies/admin.strategy.js'
import { BloomreachModule } from '../bloomreach/bloomreach.module.js'
import ClientsModule from '../clients/clients.module.js'
import { NorisModule } from '../noris/noris.module.js'
import ThrowerErrorGuard from '../utils/guards/errors.guard.js'
import { CityAccountSubservice } from '../utils/subservices/cityaccount.subservice.js'
import { QrCodeSubservice } from '../utils/subservices/qrcode.subservice.js'
import { AdminController } from './admin.controller.js'
import { AdminService } from './admin.service.js'

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
