import { Module } from '@nestjs/common'
import { BloomreachModule } from 'src/bloomreach/bloomreach.module'
import { NorisModule } from 'src/noris/noris.module'
import { CityAccountSubservice } from 'src/utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from 'src/utils/subservices/qrcode.subservice'

import { AdminStrategy } from '../auth/strategies/admin.strategy'
import ClientsModule from '../clients/clients.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
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
