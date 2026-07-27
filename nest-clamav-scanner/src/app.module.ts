import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClamavClientModule } from './clamav-client/clamav-client.module'
import ClientsModule from './clients/clients.module'
import BaConfigModule from './config/ba-config.module'
import { MinioClientModule } from './minio-client/minio-client.module'
import { PrismaModule } from './prisma/prisma.module'
import { ScannerModule } from './scanner/scanner.module'
import { ScannerCronModule } from './scanner-cron/scanner-cron.module'
import { StatusModule } from './status/status.module'

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    BaConfigModule,
    ClientsModule,
    StatusModule,
    ScannerModule,
    PrismaModule,
    AuthModule,
    MinioClientModule,
    ClamavClientModule,
    ScheduleModule.forRoot(),
    ScannerCronModule,
  ],
})
export class AppModule {}
